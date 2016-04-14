'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createModelBuffers = createModelBuffers;
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