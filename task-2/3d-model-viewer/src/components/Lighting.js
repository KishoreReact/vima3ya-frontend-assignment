/**
 * Lighting.js — Cinematic lighting rig for the 3D viewer.
 * All lights and helpers are registered in the disposables array
 * so they can be cleaned up on viewer destroy.
 */

export function setupLighting(scene, THREE, disposables) {
  // Ambient — soft base fill
  const ambient = new THREE.AmbientLight(0x1a1a2e, 2.5);
  scene.add(ambient);

  // Key light — warm front-right
  const keyLight = new THREE.DirectionalLight(0x6fa8ff, 3.5);
  keyLight.position.set(4, 6, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -8;
  keyLight.shadow.camera.right = 8;
  keyLight.shadow.camera.top = 8;
  keyLight.shadow.camera.bottom = -8;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);
  disposables.push(keyLight.shadow.map);

  // Fill light — cool left
  const fillLight = new THREE.DirectionalLight(0xa855f7, 1.5);
  fillLight.position.set(-5, 3, -2);
  scene.add(fillLight);

  // Rim light — cyan back
  const rimLight = new THREE.DirectionalLight(0x22d3ee, 2.0);
  rimLight.position.set(0, -2, -5);
  scene.add(rimLight);

  // Point light — floating glow under model
  const pointLight = new THREE.PointLight(0x4f8ef7, 2, 6);
  pointLight.position.set(0, -1, 0);
  scene.add(pointLight);
  disposables.push(pointLight);

  // Subtle hemisphere
  const hemi = new THREE.HemisphereLight(0x0a0a1a, 0x000000, 0.5);
  scene.add(hemi);
}
