# NOTES.md — 3D Model Viewer

## File Size: Before vs. After Draco Compression

| Stage | File | Size |
|-------|------|------|
| Original (exported from Three.js) | `model.glb` | **79,684 bytes (~77.8 KB)** |
| After Draco compression | `model-compressed.glb` | **12,608 bytes (~12.3 KB)** |
| **Savings** | | **84% reduction** |

Compressed using:
```bash
npx gltf-pipeline -i public/models/model.glb -o public/models/model-compressed.glb --draco.compressMeshes
```

---

## What Lazy Loading Three.js Prevents (and Why It Matters)

Three.js is a large library — around **600 KB minified** (and ~1.8 MB unminified). Loading it synchronously in a `<script>` tag in `<head>` or with `defer` still means the browser must **download, parse, and compile** the entire file before it can execute any JavaScript.

**Without lazy loading:**
- The browser's render pipeline is blocked waiting for Three.js
- The user sees a **blank screen** or a loading spinner that can't even render until the JS is parsed
- On slow networks or mid-range phones, this can add **1–3+ seconds** of perceived blank time

**With dynamic `import()` (lazy loading):**
```js
const THREE = await import('three');
```
- The HTML shell (header, loading overlay, sidebar) **paints immediately** before Three.js arrives
- The user sees a **branded loading screen with animated spinner** — perceived performance is dramatically better
- Three.js is fetched in parallel while the browser renders the static UI
- On repeat visits, the browser's cache can serve Three.js instantly, while the model loads fresh

**In React, this maps to `React.lazy` + `Suspense`**, which achieves the same split: the component boundary that imports Three.js is deferred until needed.

---

## What Would Break If You Skipped `dispose()` in a Long-Running Session

In a Single-Page Application (SPA) where users swap models without refreshing:

### GPU Memory Leak (most serious)
Every `BufferGeometry` uploads data to the GPU as a **WebGL buffer**. Without `geometry.dispose()`, these buffers remain allocated on the GPU indefinitely. Modern browsers give each WebGL context a fixed VRAM budget. Exhausting it causes:
- **Context loss** (the canvas goes black, `webglcontextlost` fires)
- On some systems, the entire tab crashes

### JS Heap Accumulation
`Material` and `Texture` objects hold large typed arrays (normal maps, roughness maps, etc.). Without `material.dispose()` and `texture.dispose()`, the JS garbage collector **cannot reclaim these** because Three.js holds internal references. After several model swaps, heap usage climbs into hundreds of megabytes.

### WebGL Context Reference Leak
The renderer itself holds a WebGL context. Without `renderer.dispose()` and `renderer.forceContextLoss()`, old contexts linger. Browsers typically limit a page to **16 WebGL contexts**. Exceeding this silently fails, leaving new canvases blank.

### How This Viewer Handles It
All resources are registered in a `disposables` array at creation time:
```js
disposables.push(geometry, material, texture);
```
On cleanup (`window.__disposeViewer()`), everything is disposed in order:
```js
disposables.forEach(item => { try { item.dispose(); } catch (_) {} });
renderer.dispose();
renderer.forceContextLoss();
```

**Rule of thumb:** every `new THREE.BufferGeometry()`, `new THREE.Material()`, and `new THREE.Texture()` needs a matching `.dispose()` call when it leaves scope.
