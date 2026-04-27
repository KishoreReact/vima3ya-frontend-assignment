/**
 * main.js — Entry point
 *
 * Three.js is intentionally loaded via a dynamic import (lazy loading).
 * This prevents Three.js (~600KB) from blocking the initial page render.
 * The browser can paint the HTML shell and loading UI immediately,
 * then fetch Three.js in parallel.
 */

import { updateProgress, setConsoleLog, hideLoader } from './utils/ui.js';

async function init() {
  updateProgress(5, 'Rendering page shell…');

  // ─── LAZY LOAD Three.js ──────────────────────────────────────────────────
  // Why lazy? Three.js is ~600KB minified. If loaded synchronously in <head>,
  // it blocks the browser from painting ANY content until fully parsed.
  // With dynamic import, the page HTML and CSS render first (loading screen
  // is visible immediately), then Three.js is fetched in parallel.
  // ─────────────────────────────────────────────────────────────────────────
  setConsoleLog('Lazy-loading Three.js via dynamic import…');
  updateProgress(10, 'Lazy-loading Three.js…');

  const [THREE, { OrbitControls }, { GLTFLoader }, { DRACOLoader }] = await Promise.all([
    import('three'),
    import('three/examples/jsm/controls/OrbitControls.js'),
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/loaders/DRACOLoader.js'),
  ]);

  setConsoleLog('Three.js loaded. Setting up renderer…');
  updateProgress(30, 'Three.js loaded. Building scene…');

  // Dynamically import the viewer module (further code-splitting)
  const { setupViewer } = await import('./components/Viewer.js');

  updateProgress(45, 'Scene ready. Configuring DRACOLoader…');
  setConsoleLog('Configuring DRACOLoader with Draco v1.5.6 decoder…');

  await setupViewer({ THREE, OrbitControls, GLTFLoader, DRACOLoader, updateProgress, setConsoleLog, hideLoader });
}

init().catch((err) => {
  console.error('[3D Viewer] Fatal init error:', err);
  setConsoleLog(`Error: ${err.message}`, 'error');
});
