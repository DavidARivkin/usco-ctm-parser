export function createModelBuffers ( file ) {
  console.log("creating model buffers")

  let indices   = file.body.indices
  let positions = file.body.vertices
  let normals   = file.body.normals
  let uvs       = []
  let colors    = []

  //materials = []

  let uvMaps    = file.body.uvMaps
  if ( uvMaps !== undefined && uvMaps.length > 0 ) {
    uvs = uvMaps[ 0 ].uv
  }

  let attrMaps = file.body.attrMaps
  if ( attrMaps !== undefined && attrMaps.length > 0 && attrMaps[ 0 ].name === 'Color' ) {
    colors = attrMaps[ 0 ].attr
  }

  /*
    geometry.computeOffsets();

  // compute vertex normals if not present in the CTM model
  if ( geometry.attributes.normal === undefined ) {
    geometry.computeVertexNormals();
  }*/

  return {positions, indices, normals, uvs, colors}
}