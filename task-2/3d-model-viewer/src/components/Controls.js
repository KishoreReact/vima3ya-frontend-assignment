/**
 * Controls.js — Wires the side-panel UI toggles to the Three.js scene.
 */

export function setupControls({ modelRoot, controls, renderer, scene, camera, THREE, fps, disposables }) {
  // ── Auto-rotate toggle ──────────────────────────────────────────────────
  const toggleRotate = document.getElementById('toggleRotate');
  const knobRotate = toggleRotate?.querySelector('.toggle-knob');
  let autoRotate = true;

  toggleRotate?.addEventListener('click', () => {
    autoRotate = !autoRotate;
    window.__autoRotate = autoRotate;
    controls.autoRotate = false; // we handle rotation manually on modelRoot
    toggleRotate.classList.toggle('on', autoRotate);
    if (knobRotate) knobRotate.classList.toggle('active', autoRotate);
  });

  // ── Wireframe toggle ───────────────────────────────────────────────────
  const toggleWire = document.getElementById('toggleWire');
  const knobWire = toggleWire?.querySelector('.toggle-knob');
  let wireframe = false;

  toggleWire?.addEventListener('click', () => {
    wireframe = !wireframe;
    toggleWire.classList.toggle('on', wireframe);
    if (knobWire) knobWire.classList.toggle('active', wireframe);

    modelRoot?.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          m.wireframe = wireframe;
        });
      }
    });
  });

  // ── Environment / fog toggle ───────────────────────────────────────────
  const toggleEnv = document.getElementById('toggleEnv');
  const knobEnv = toggleEnv?.querySelector('.toggle-knob');
  let fogOn = true;

  toggleEnv?.addEventListener('click', () => {
    fogOn = !fogOn;
    toggleEnv.classList.toggle('on', fogOn);
    if (knobEnv) knobEnv.classList.toggle('active', fogOn);
    scene.fog = fogOn ? new THREE.FogExp2(0x080a0f, 0.08) : null;
  });

  // ── FPS counter ────────────────────────────────────────────────────────
  const statFPS = document.getElementById('statFPS');
  if (fps && statFPS) {
    setInterval(() => {
      statFPS.textContent = fps.current ?? '—';
    }, 500);
  }
}
