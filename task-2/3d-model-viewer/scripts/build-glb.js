const fs = require('fs');

function align4(n) { return Math.ceil(n/4)*4; }

function bbox(arr) {
  let mn = [Infinity,Infinity,Infinity], mx = [-Infinity,-Infinity,-Infinity];
  for (let i = 0; i < arr.length; i+=3) {
    mn[0] = Math.min(mn[0],arr[i]); mx[0] = Math.max(mx[0],arr[i]);
    mn[1] = Math.min(mn[1],arr[i+1]); mx[1] = Math.max(mx[1],arr[i+1]);
    mn[2] = Math.min(mn[2],arr[i+2]); mx[2] = Math.max(mx[2],arr[i+2]);
  }
  return { min: mn, max: mx };
}

function buildGLB() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const icoS = 0.55;
  const icoNorm = Math.sqrt(1 + phi*phi);
  const icoRaw = [[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,1],[phi,0,-1],[-phi,0,1],[-phi,0,-1]];

  const R=0.9, r=0.25, segs=16, tubeSegs=8;
  const tv=[], ti=[];
  for(let i=0;i<=segs;i++){
    const t=(i/segs)*Math.PI*2;
    for(let j=0;j<=tubeSegs;j++){
      const p=(j/tubeSegs)*Math.PI*2;
      tv.push((R+r*Math.cos(p))*Math.cos(t), r*Math.sin(p), (R+r*Math.cos(p))*Math.sin(t));
    }
  }
  for(let i=0;i<segs;i++) for(let j=0;j<tubeSegs;j++){
    const a=i*(tubeSegs+1)+j, b=a+tubeSegs+1;
    ti.push(a,b,a+1, b,b+1,a+1);
  }

  const s=0.11;
  const cubeVBase = [-s,-s,-s, s,-s,-s, s,s,-s, -s,s,-s, -s,-s,s, s,-s,s, s,s,s, -s,s,s];
  const cubeIBase = [0,1,2,0,2,3, 4,6,5,4,7,6, 0,5,1,0,4,5, 2,7,3,2,6,7, 0,7,4,0,3,7, 1,6,2,1,5,6];

  const meshDefs = [
    { v: [0,1.2,0, 1.2,0,0, 0,0,1.2, -1.2,0,0, 0,0,-1.2, 0,-1.2,0],
      i: [0,1,2,0,2,3,0,3,4,0,4,1,5,2,1,5,3,2,5,4,3,5,1,4],
      color:[0.31,0.56,0.97,1], tx:0,ty:0,tz:0 },
    { v: tv, i: ti, color:[0.66,0.33,0.97,1], tx:0,ty:0,tz:0 },
    { v: icoRaw.flatMap(v=>v.map(x=>x/icoNorm*icoS)),
      i: [0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],
      color:[0.13,0.83,0.93,1], tx:0,ty:1.5,tz:0 },
  ];
  for(let i=0;i<4;i++){
    const angle=(i/4)*Math.PI*2;
    meshDefs.push({ v:[...cubeVBase], i:[...cubeIBase], color:[0.976,0.451,0.086,1], tx:Math.cos(angle)*1.6, ty:0, tz:Math.sin(angle)*1.6 });
  }

  const parts = [];
  let offset = 0;
  const accessors = [], bufferViews = [];

  for(const m of meshDefs){
    const vArr = new Float32Array(m.v);
    const iArr = new Uint16Array(m.i);

    // Indices BV (no byteStride for indices!)
    const iBytes = iArr.byteLength;
    bufferViews.push({ buffer:0, byteOffset: offset, byteLength: iBytes, target: 34963 });
    m._iAcc = accessors.length;
    accessors.push({ bufferView: bufferViews.length-1, byteOffset:0, componentType:5123, count:iArr.length, type:'SCALAR' });
    parts.push(Buffer.from(iArr.buffer));
    const iPad = align4(iBytes)-iBytes;
    if(iPad) parts.push(Buffer.alloc(iPad,0));
    offset += align4(iBytes);

    // Vertices BV
    const vBytes = vArr.byteLength;
    bufferViews.push({ buffer:0, byteOffset: offset, byteLength: vBytes, target: 34962 });
    m._vAcc = accessors.length;
    const bb = bbox(vArr);
    accessors.push({ bufferView: bufferViews.length-1, byteOffset:0, componentType:5126, count:vArr.length/3, type:'VEC3', min:bb.min, max:bb.max });
    parts.push(Buffer.from(vArr.buffer));
    const vPad = align4(vBytes)-vBytes;
    if(vPad) parts.push(Buffer.alloc(vPad,0));
    offset += align4(vBytes);
  }

  const binBuf = Buffer.concat(parts);

  const gltf = {
    asset:{version:'2.0',generator:'custom-3d-viewer-builder'},
    scene:0,
    scenes:[{nodes:meshDefs.map((_,i)=>i)}],
    nodes:meshDefs.map((m,i)=>({mesh:i,translation:[m.tx,m.ty,m.tz]})),
    meshes:meshDefs.map((m,i)=>({name:`shape_${i}`,primitives:[{attributes:{POSITION:m._vAcc},indices:m._iAcc,material:i,mode:4}]})),
    materials:meshDefs.map(m=>({pbrMetallicRoughness:{baseColorFactor:m.color,metallicFactor:0.7,roughnessFactor:0.3}})),
    accessors, bufferViews,
    buffers:[{byteLength:binBuf.length}]
  };

  const jsonStr = JSON.stringify(gltf);
  const jsonBuf = Buffer.from(jsonStr,'utf8');
  const jsonPad = align4(jsonBuf.length)-jsonBuf.length;
  const jsonPadded = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad,0x20)]);
  const binPad = align4(binBuf.length)-binBuf.length;
  const binPadded = Buffer.concat([binBuf, Buffer.alloc(binPad,0)]);

  const totalLen = 12+8+jsonPadded.length+8+binPadded.length;
  const hdr = Buffer.alloc(12);
  hdr.writeUInt32LE(0x46546C67,0);
  hdr.writeUInt32LE(2,4);
  hdr.writeUInt32LE(totalLen,8);

  const jChunk = Buffer.alloc(8);
  jChunk.writeUInt32LE(jsonPadded.length,0);
  jChunk.writeUInt32LE(0x4E4F534A,4);

  const bChunk = Buffer.alloc(8);
  bChunk.writeUInt32LE(binPadded.length,0);
  bChunk.writeUInt32LE(0x004E4942,4);

  const glb = Buffer.concat([hdr,jChunk,jsonPadded,bChunk,binPadded]);
  fs.writeFileSync('./public/models/model.glb', glb);
  console.log(`✓ model.glb: ${(glb.length/1024).toFixed(1)} KB`);
}

buildGLB();
