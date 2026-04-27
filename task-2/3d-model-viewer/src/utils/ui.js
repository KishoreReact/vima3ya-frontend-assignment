/**
 * ui.js — DOM helpers for loader progress and console log bar.
 */

export function updateProgress(pct, label) {
  const bar = document.getElementById('progressBar');
  const text = document.getElementById('progressText');

  if (bar) bar.style.width = `${Math.min(pct, 100)}%`;
  if (text) text.textContent = `${Math.round(pct)}%`;

  const sub = document.querySelector('.loader-sub');
  if (sub && label) sub.textContent = label;
}

export function setConsoleLog(msg, type = '') {
  const el = document.getElementById('consoleText');
  if (!el) return;
  el.textContent = msg;
  el.className = type; // '' | 'success' | 'error'
}

export function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');
}
