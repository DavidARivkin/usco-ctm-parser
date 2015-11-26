export function createModelBuffers ( file ) {
  console.log("creating model buffers")

var Model = function () {

    THREE.BufferGeometry.call( this );

    this.materials = [];

    var indices = file.body.indices,
    positions = file.body.vertices,
    normals = file.body.normals;

    var uvs, colors;

    var uvMaps = file.body.uvMaps;

    if ( uvMaps !== undefined && uvMaps.length > 0 ) {

      uvs = uvMaps[ 0 ].uv;

    }

    var attrMaps = file.body.attrMaps;

    if ( attrMaps !== undefined && attrMaps.length > 0 && attrMaps[ 0 ].name === 'Color' ) {

      colors = attrMaps[ 0 ].attr;

    }

    this.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
    this.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

    if ( normals !== undefined ) {

      this.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

    }

    if ( uvs !== undefined ) {

      this.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

    }

    if ( colors !== undefined ) {

      this.addAttribute( 'color', new THREE.BufferAttribute( colors, 4 ) );

    }

  }

  Model.prototype = Object.create( THREE.BufferGeometry.prototype );

  var geometry = new Model();

  geometry.computeOffsets();

  // compute vertex normals if not present in the CTM model
  if ( geometry.attributes.normal === undefined ) {
    geometry.computeVertexNormals();
  }


  return geometry;
};