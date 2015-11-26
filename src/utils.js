export function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length)
    var view = new Uint8Array(ab)
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i]
    }
    return ab
}

export function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2) // 2 bytes for each char
  var bufView = new Uint16Array(buf)
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

export function str2ab2(str)
{
   var idx, len = str.length, arr = new Array( len )
    for ( idx = 0 ; idx < len ; ++idx ) {
        arr[ idx ] = str.charCodeAt(idx) & 0xFF
    }
    // You may create an ArrayBuffer from a standard array (of values) as follows:
    return new Uint8Array( arr ).buffer
}


export function ensureArrayBuffer ( data )
{
  if (typeof data == 'string' || data instanceof String)
  {
    return str2ab2(data)
  }
  else
  {
    return data
  }
}