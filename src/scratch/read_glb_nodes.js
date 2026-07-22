const fs = require('fs');

function parseGlb(filePath) {
  console.log('Parsing:', filePath);
  const fd = fs.openSync(filePath, 'r');
  const header = Buffer.alloc(12);
  fs.readSync(fd, header, 0, 12, 0);
  
  const magic = header.toString('utf8', 0, 4);
  if (magic !== 'glTF') {
    console.error('Not a valid GLB file');
    return;
  }
  
  const chunkHeader = Buffer.alloc(8);
  fs.readSync(fd, chunkHeader, 0, 8, 12);
  const chunkLength = chunkHeader.readUInt32LE(0);
  const chunkType = chunkHeader.toString('utf8', 4, 8);
  
  if (chunkType !== 'JSON') {
    console.error('First chunk is not JSON');
    return;
  }
  
  const jsonBuffer = Buffer.alloc(chunkLength);
  fs.readSync(fd, jsonBuffer, 0, chunkLength, 20);
  fs.closeSync(fd);
  
  const gltf = JSON.parse(jsonBuffer.toString('utf8'));
  console.log('Meshes:');
  if (gltf.meshes) {
    gltf.meshes.forEach(m => {
      console.log(` - Mesh: "${m.name}"`);
    });
  }
  console.log('Nodes:');
  if (gltf.nodes) {
    gltf.nodes.forEach(n => {
      if (n.name) console.log(` - Node: "${n.name}"`);
    });
  }
  console.log('Materials:');
  if (gltf.materials) {
    gltf.materials.forEach(mat => {
      console.log(` - Material: "${mat.name}"`);
    });
  }
}

const arg = process.argv[2];
if (arg) {
  parseGlb(arg);
} else {
  console.log('Please provide a file path');
}
