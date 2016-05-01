'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unIndexGeometryData = unIndexGeometryData;
exports.createModelBuffers = createModelBuffers;
/*
  un-indexes raw geometry data hash with indices
  @geomData: hash containing arraybuffers, by attributes : ie
  {
      position: [....],
      normal: [....],
      indices: [...]
  }
*/
function unIndexGeometryData(geomData) {
  if (!('indices' in geomData)) {
    return geomData;
  }
  var bufferTypes = ['positions', 'normals', 'colors', 'uvs'];
  var bufferTypeSizes = { positions: 3, normals: 3, colors: 4, uvs: 3 };
  var output = {};
  geomData.indices.forEach(function (inputIndex, outIndex) {
    bufferTypes.forEach(function (bufferType) {
      if (geomData[bufferType] && geomData[bufferType].length > 0) {
        var size = bufferTypeSizes[bufferType];

        if (!output[bufferType]) {
          output[bufferType] = new Float32Array(geomData.indices.length * size);
        }

        for (var i = 0; i < size; i++) {
          output[bufferType][outIndex * size + i] = geomData[bufferType][inputIndex * size + i];
        }
        // output[bufferType][outIndex * size] = geomData[bufferType][inputIndex * size]
        // output[bufferType][outIndex * size + 1] = geomData[bufferType][inputIndex * size + 1]
        // output[bufferType][outIndex * size + 2] = geomData[bufferType][inputIndex * size + 2]
      }
    });
  });
  return output;
}

function createModelBuffers(file) {
  console.log('creating model buffers');

  var indices = file.body.indices;
  var positions = file.body.vertices;
  var normals = file.body.normals;
  var uvs = [];
  var colors = [];

  // materials = []

  var uvMaps = file.body.uvMaps;
  if (uvMaps !== undefined && uvMaps.length > 0) {
    uvs = uvMaps[0].uv;
  }

  var attrMaps = file.body.attrMaps;
  if (attrMaps !== undefined && attrMaps.length > 0 && attrMaps[0].name === 'Color') {
    colors = attrMaps[0].attr;
  }

  /*
    geometry.computeOffsets()
   // compute vertex normals if not present in the CTM model
  if ( geometry.attributes.normal === undefined ) {
    geometry.computeVertexNormals()
  }*/

  return { positions: positions, indices: indices, normals: normals, uvs: uvs, colors: colors };
}