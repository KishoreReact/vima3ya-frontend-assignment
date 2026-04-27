/**
 * Viewer.js — Core Three.js scene, camera, renderer, and model loader.
 *
 * Memory management note:
 * Every geometry, material, and texture is tracked for disposal.
 * If dispose() is skipped in a long-running SPA, GPU memory and JS heap
 * will accumulate with each model swap, eventually causing crashes or
 * severe performance degradation. See NOTES.md for details.
 */

import { setupControls } from './Controls.js';
import { setupLighting } from './Lighting.js';
import { buildStats } from '../utils/stats.js';

// Track all disposable resources for cleanup
const disposables = [];

export async function setupViewer({ THREE, OrbitControls, GLTFLoader, DRACOLoader, updateProgress, setConsoleLog, hideLoader }) {
  const canvas = document.getElementById('threeCanvas');
  const container = document.getElementById('canvasContainer') || canvas.parentElement;

  // ─── RENDERER ───────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ─── SCENE ──────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080a0f);
  scene.fog = new THREE.FogExp2(0x080a0f, 0.08);

  // ─── CAMERA ─────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.5, 5);

  // ─── LIGHTS ─────────────────────────────────────────────────────────────
  setupLighting(scene, THREE, disposables);

  // ─── CONTROLS ───────────────────────────────────────────────────────────
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1.5;
  controls.maxDistance = 12;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;

  // ─── GROUND GRID ────────────────────────────────────────────────────────
  const gridHelper = new THREE.GridHelper(20, 30, 0x1a2030, 0x111827);
  gridHelper.position.y = -1.8;
  gridHelper.material.opacity = 0.4;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);
  disposables.push(gridHelper.geometry, gridHelper.material);

  updateProgress(60, 'Loading Draco decoder…');

  // ─── DRACO LOADER ───────────────────────────────────────────────────────
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  dracoLoader.preload(); // warm up decoder worker in background

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  updateProgress(75, 'Fetching model-compressed.glb…');
  setConsoleLog('Fetching Draco-compressed GLB…');

  // ─── LOAD MODEL ─────────────────────────────────────────────────────────
  const start = performance.now();

  let modelRoot = null;
  let meshCount = 0;
  let vertexCount = 0;

  try {
    const gltf = await new Promise((resolve, reject) => {
      loader.load(
        '/models/model-compressed.glb',
        resolve,
        (xhr) => {
          if (xhr.lengthComputable) {
            const pct = Math.round((xhr.loaded / xhr.total) * 100);
            updateProgress(75 + pct * 0.2, `Downloading… ${pct}%`);
          }
        },
        reject
      );
    });

    const loadMs = (performance.now() - start).toFixed(2);
    console.log(`Model loaded in ${loadMs}ms`); // required console log

    modelRoot = gltf.scene;

    // Center and scale model
    const box = new THREE.Box3().setFromObject(modelRoot);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDim;
    modelRoot.scale.setScalar(scale);
    modelRoot.position.sub(center.multiplyScalar(scale));
    modelRoot.position.y -= 0.5;

    // Track all geometries and materials for later dispose()
    modelRoot.traverse((obj) => {
      if (obj.isMesh) {
        meshCount++;
        if (obj.geometry) {
          disposables.push(obj.geometry);
          const pos = obj.geometry.attributes.position;
          if (pos) vertexCount += pos.count;
        }
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            disposables.push(m);
            Object.values(m).forEach((v) => {
              if (v && v.isTexture) disposables.push(v);
            });
          });
        }
        // Enable shadows
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    scene.add(modelRoot);

    // Update UI stats
    updateProgress(100, 'Model loaded!');
    document.getElementById('statLoadTime').textContent = `${loadMs}ms`;
    document.getElementById('statMeshes').textContent = meshCount;

    const fps = buildStats();
    setConsoleLog(`✓ Model loaded in ${loadMs}ms · ${meshCount} meshes · ${vertexCount.toLocaleString()} vertices`, 'success');

    setTimeout(() => hideLoader(), 400);

    // ─── CONTROLS PANEL ────────────────────────────────────────────────
    setupControls({ modelRoot, controls, renderer, scene, camera, THREE, fps, disposables });

  } catch (err) {
    console.error('[Viewer] Failed to load model:', err);
    setConsoleLog(`Failed to load model: ${err.message}`, 'error');
    updateProgress(100, 'Load failed.');
    setTimeout(() => hideLoader(), 800);
  }

  // ─── RESIZE HANDLER ─────────────────────────────────────────────────────
  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  // ─── RENDER LOOP ────────────────────────────────────────────────────────
  let frameId;
  const clock = new THREE.Clock();

  function animate() {
    frameId = requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (modelRoot && window.__autoRotate !== false) {
      // Subtle floating animation on the model group
      modelRoot.rotation.y += delta * (window.__rotateSpeed ?? 0.3);
    }

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // ─── CLEANUP / DISPOSE ─────────────────────────────────────────────────
  // This is critical for SPAs. Without dispose(), every model load leaks:
  //  - GPU VRAM (geometry buffers stay on the GPU)
  //  - JS heap (material/texture objects stay in memory)
  //  - WebGL context references (can exhaust context limit)
  window.__disposeViewer = () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', onResize);
    controls.dispose();
    dracoLoader.dispose();
    disposables.forEach((item) => {
      try { item.dispose(); } catch (_) {}
    });
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
