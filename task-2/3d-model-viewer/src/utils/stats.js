/**
 * stats.js — Lightweight FPS tracker (no external dependency).
 * Updates window.__fps and returns an object with a `current` property.
 */

export function buildStats() {
  const fps = { current: 0 };
  let frames = 0;
  let lastTime = performance.now();

  function tick() {
    frames++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      fps.current = frames;
      frames = 0;
      lastTime = now;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return fps;
}
