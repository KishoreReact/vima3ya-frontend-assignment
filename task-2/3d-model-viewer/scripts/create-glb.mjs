import { writeFileSync } from 'fs';
import * as THREE from 'three';

// Build scene
const scene = new THREE.Scene();
const group = new THREE.Group();

const shapes = [
  [new THREE.OctahedronGeometry(1.2, 0), 0x4f8ef7, [0,0,0]],
  [new THREE.TorusGeometry(0.9, 0.25, 8, 16), 0xa855f7, [0,0,0]],
  [new THREE.IcosahedronGeometry(0.55, 0), 0x22d3ee, [0,1.5,0]],
];

shapes.forEach(([geo, color, pos]) => {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.7 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...pos);
  group.add(mesh);
});

for (let i = 0; i < 4; i++) {
  const angle = (i / 4) * Math.PI * 2;
  const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  const mat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4, metalness: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 1.6, 0, Math.sin(angle) * 1.6);
  group.add(mesh);
}

scene.add(group);

// Manually build GLB using binary encoding
// We'll encode the scene as GLTF JSON + binary buffer
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Patch Blob for Node.js
if (typeof Blob === 'undefined') {
  global.Blob = class Blob {
    constructor(parts, opts) {
      this._parts = parts;
    }
    arrayBuffer() {
      const bufs = this._parts.map(p => {
        if (p instanceof ArrayBuffer) return Buffer.from(p);
        if (typeof p === 'string') return Buffer.from(p);
        return Buffer.from(p);
      });
      return Promise.resolve(Buffer.concat(bufs));
    }
  };
}
if (typeof FileReader === 'undefined') {
  global.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then(buf => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
      });
    }
  };
}
if (typeof URL === 'undefined') {
  global.URL = { createObjectURL: () => '', revokeObjectURL: () => '' };
}

const exporter = new GLTFExporter();
await new Promise((resolve) => {
  exporter.parse(scene, (result) => {
    const buf = result instanceof ArrayBuffer ? Buffer.from(result) : Buffer.from(JSON.stringify(result));
    writeFileSync('./public/models/model.glb', buf);
    console.log(`✓ model.glb: ${(buf.length/1024).toFixed(1)} KB`);
    resolve();
  }, (err) => { console.error(err); resolve(); }, { binary: true });
});
