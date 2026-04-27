import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { writeFileSync } from 'fs';

// Polyfill for Node.js
global.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
    });
  }
};

const scene = new THREE.Scene();
const group = new THREE.Group();

// Base octahedron
const octaGeo = new THREE.OctahedronGeometry(1.2, 0);
const mat1 = new THREE.MeshStandardMaterial({ color: 0x4f8ef7, roughness: 0.3, metalness: 0.7 });
const octa = new THREE.Mesh(octaGeo, mat1);
group.add(octa);

// Torus ring
const torusGeo = new THREE.TorusGeometry(0.9, 0.25, 8, 16);
const mat2 = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.2, metalness: 0.8 });
const torus = new THREE.Mesh(torusGeo, mat2);
torus.rotation.x = Math.PI / 2;
group.add(torus);

// Top icosahedron
const icoGeo = new THREE.IcosahedronGeometry(0.55, 0);
const mat3 = new THREE.MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.1, metalness: 0.9 });
const ico = new THREE.Mesh(icoGeo, mat3);
ico.position.y = 1.5;
group.add(ico);

// 4 orbiting cubes
for (let i = 0; i < 4; i++) {
  const angle = (i / 4) * Math.PI * 2;
  const cubeGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4, metalness: 0.6 });
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.position.set(Math.cos(angle) * 1.6, 0, Math.sin(angle) * 1.6);
  cube.rotation.y = angle;
  group.add(cube);
}

scene.add(group);

// Directional lights only (GLTFExporter supports these)
const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight1.position.set(5, 10, 5);
scene.add(dirLight1);
const dirLight2 = new THREE.DirectionalLight(0x8888ff, 0.5);
dirLight2.position.set(-5, -2, -5);
scene.add(dirLight2);

const exporter = new GLTFExporter();
exporter.parse(scene, (result) => {
  const buffer = Buffer.from(result);
  writeFileSync('./public/models/model.glb', buffer);
  const kb = (buffer.length / 1024).toFixed(1);
  console.log(`✓ model.glb exported: ${kb} KB`);
}, (err) => console.error(err), { binary: true });
