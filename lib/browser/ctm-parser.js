(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ctmParser = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process){
(function () {
  // Hueristics.
  var isNode = typeof process !== 'undefined' && process.versions && !!process.versions.node;
  var isBrowser = typeof window !== 'undefined';
  var isModule = typeof module !== 'undefined' && !!module.exports;

  // Export.
  var detect = (isModule ? exports : (this.detect = {}));
  detect.isNode = isNode;
  detect.isBrowser = isBrowser;
  detect.isModule = isModule;
}).call(this);
}).call(this,require('_process'))
},{"_process":1}],3:[function(require,module,exports){
'use strict';

/**
 * Analogue of Object.assign().
 * Copies properties from one or more source objects to
 * a target object. Existing keys on the target object will be overwritten.
 *
 * > Note: This differs from spec in some important ways:
 * > 1. Will throw if passed non-objects, including `undefined` or `null` values.
 * > 2. Does not support the curious Exception handling behavior, exceptions are thrown immediately.
 * > For more details, see:
 * > https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 *
 *
 *
 * @param  {Object} target      The target object to copy properties to.
 * @param  {Object} source, ... The source(s) to copy properties from.
 * @return {Object}             The updated target object.
 */
module.exports = function fastAssign (target) {
  var totalArgs = arguments.length,
      source, i, totalKeys, keys, key, j;

  for (i = 1; i < totalArgs; i++) {
    source = arguments[i];
    keys = Object.keys(source);
    totalKeys = keys.length;
    for (j = 0; j < totalKeys; j++) {
      key = keys[j];
      target[key] = source[key];
    }
  }
  return target;
};

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lzma = require('./lzma');

var _lzma2 = _interopRequireDefault(_lzma);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var CTM = CTM || {}; /*
                     Copyright (c) 2011 Juan Mellado
                     
                     Permission is hereby granted, free of charge, to any person obtaining a copy
                     of this software and associated documentation files (the "Software"), to deal
                     in the Software without restriction, including without limitation the rights
                     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                     copies of the Software, and to permit persons to whom the Software is
                     furnished to do so, subject to the following conditions:
                     
                     The above copyright notice and this permission notice shall be included in
                     all copies or substantial portions of the Software.
                     
                     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
                     THE SOFTWARE.
                     */

/*
References:
- "OpenCTM: The Open Compressed Triangle Mesh file format" by Marcus Geelnard
  http://openctm.sourceforge.net/
*/

CTM.CompressionMethod = {
  RAW: 0x00574152,
  MG1: 0x0031474d,
  MG2: 0x0032474d
};

CTM.Flags = {
  NORMALS: 0x00000001
};

CTM.File = function (stream) {
  this.load(stream);
};

CTM.File.prototype.load = function (stream) {
  this.header = new CTM.FileHeader(stream);
  this.body = new CTM.FileBody(this.header);

  this.getReader().read(stream, this.body);
  /*  var reader = this.getReader()
    reader.read(stream, this.body);*/
};

CTM.File.prototype.getReader = function () {
  var reader;

  switch (this.header.compressionMethod) {
    case CTM.CompressionMethod.RAW:
      reader = new CTM.ReaderRAW();
      break;
    case CTM.CompressionMethod.MG1:
      reader = new CTM.ReaderMG1();
      break;
    case CTM.CompressionMethod.MG2:
      reader = new CTM.ReaderMG2();
      break;
  }

  return reader;
};

CTM.FileHeader = function (stream) {
  stream.readInt32(); // magic "OCTM"
  this.fileFormat = stream.readInt32();
  this.compressionMethod = stream.readInt32();
  this.vertexCount = stream.readInt32();
  this.triangleCount = stream.readInt32();
  this.uvMapCount = stream.readInt32();
  this.attrMapCount = stream.readInt32();
  this.flags = stream.readInt32();
  this.comment = stream.readString();
};

CTM.FileHeader.prototype.hasNormals = function () {
  return this.flags & CTM.Flags.NORMALS;
};

CTM.FileBody = function (header) {
  var i = header.triangleCount * 3,
      v = header.vertexCount * 3,
      n = header.hasNormals() ? header.vertexCount * 3 : 0,
      u = header.vertexCount * 2,
      a = header.vertexCount * 4,
      j = 0;

  var data = new ArrayBuffer((i + v + n + u * header.uvMapCount + a * header.attrMapCount) * 4);

  this.indices = new Uint32Array(data, 0, i);

  this.vertices = new Float32Array(data, i * 4, v);

  if (header.hasNormals()) {
    this.normals = new Float32Array(data, (i + v) * 4, n);
  }

  if (header.uvMapCount) {
    this.uvMaps = [];
    for (j = 0; j < header.uvMapCount; ++j) {
      this.uvMaps[j] = { uv: new Float32Array(data, (i + v + n + j * u) * 4, u) };
    }
  }

  if (header.attrMapCount) {
    this.attrMaps = [];
    for (j = 0; j < header.attrMapCount; ++j) {
      this.attrMaps[j] = { attr: new Float32Array(data, (i + v + n + u * header.uvMapCount + j * a) * 4, a) };
    }
  }
};

CTM.FileMG2Header = function (stream) {
  stream.readInt32(); // magic "MG2H"
  this.vertexPrecision = stream.readFloat32();
  this.normalPrecision = stream.readFloat32();
  this.lowerBoundx = stream.readFloat32();
  this.lowerBoundy = stream.readFloat32();
  this.lowerBoundz = stream.readFloat32();
  this.higherBoundx = stream.readFloat32();
  this.higherBoundy = stream.readFloat32();
  this.higherBoundz = stream.readFloat32();
  this.divx = stream.readInt32();
  this.divy = stream.readInt32();
  this.divz = stream.readInt32();

  this.sizex = (this.higherBoundx - this.lowerBoundx) / this.divx;
  this.sizey = (this.higherBoundy - this.lowerBoundy) / this.divy;
  this.sizez = (this.higherBoundz - this.lowerBoundz) / this.divz;
};

CTM.ReaderRAW = function () {};

CTM.ReaderRAW.prototype.read = function (stream, body) {
  this.readIndices(stream, body.indices);
  this.readVertices(stream, body.vertices);

  if (body.normals) {
    this.readNormals(stream, body.normals);
  }
  if (body.uvMaps) {
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps) {
    this.readAttrMaps(stream, body.attrMaps);
  }
};

CTM.ReaderRAW.prototype.readIndices = function (stream, indices) {
  stream.readInt32(); // magic "INDX"
  stream.readArrayInt32(indices);
};

CTM.ReaderRAW.prototype.readVertices = function (stream, vertices) {
  stream.readInt32(); // magic "VERT"
  stream.readArrayFloat32(vertices);
};

CTM.ReaderRAW.prototype.readNormals = function (stream, normals) {
  stream.readInt32(); // magic "NORM"
  stream.readArrayFloat32(normals);
};

CTM.ReaderRAW.prototype.readUVMaps = function (stream, uvMaps) {
  var i = 0;
  for (; i < uvMaps.length; ++i) {
    stream.readInt32(); // magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();
    stream.readArrayFloat32(uvMaps[i].uv);
  }
};

CTM.ReaderRAW.prototype.readAttrMaps = function (stream, attrMaps) {
  var i = 0;
  for (; i < attrMaps.length; ++i) {
    stream.readInt32(); // magic "ATTR"

    attrMaps[i].name = stream.readString();
    stream.readArrayFloat32(attrMaps[i].attr);
  }
};

CTM.ReaderMG1 = function () {};

CTM.ReaderMG1.prototype.read = function (stream, body) {
  this.readIndices(stream, body.indices);
  this.readVertices(stream, body.vertices);

  if (body.normals) {
    this.readNormals(stream, body.normals);
  }
  if (body.uvMaps) {
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps) {
    this.readAttrMaps(stream, body.attrMaps);
  }
};

CTM.ReaderMG1.prototype.readIndices = function (stream, indices) {
  stream.readInt32(); // magic "INDX"
  stream.readInt32(); // packed size

  var interleaved = new CTM.InterleavedStream(indices, 3);
  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);

  CTM.restoreIndices(indices, indices.length);
};

CTM.ReaderMG1.prototype.readVertices = function (stream, vertices) {
  stream.readInt32(); // magic "VERT"
  stream.readInt32(); // packed size

  var interleaved = new CTM.InterleavedStream(vertices, 1);
  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);
};

CTM.ReaderMG1.prototype.readNormals = function (stream, normals) {
  stream.readInt32(); // magic "NORM"
  stream.readInt32(); // packed size

  var interleaved = new CTM.InterleavedStream(normals, 3);
  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);
};

CTM.ReaderMG1.prototype.readUVMaps = function (stream, uvMaps) {
  var i = 0;
  for (; i < uvMaps.length; ++i) {
    stream.readInt32(); // magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();

    stream.readInt32(); // packed size

    var interleaved = new CTM.InterleavedStream(uvMaps[i].uv, 2);
    _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);
  }
};

CTM.ReaderMG1.prototype.readAttrMaps = function (stream, attrMaps) {
  var i = 0;
  for (; i < attrMaps.length; ++i) {
    stream.readInt32(); // magic "ATTR"

    attrMaps[i].name = stream.readString();

    stream.readInt32(); // packed size

    var interleaved = new CTM.InterleavedStream(attrMaps[i].attr, 4);
    _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);
  }
};

CTM.ReaderMG2 = function () {};

CTM.ReaderMG2.prototype.read = function (stream, body) {
  this.MG2Header = new CTM.FileMG2Header(stream);

  this.readVertices(stream, body.vertices);
  this.readIndices(stream, body.indices);

  if (body.normals) {
    this.readNormals(stream, body);
  }
  if (body.uvMaps) {
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps) {
    this.readAttrMaps(stream, body.attrMaps);
  }
};

CTM.ReaderMG2.prototype.readVertices = function (stream, vertices) {
  stream.readInt32(); // magic "VERT"
  stream.readInt32(); // packed size

  var interleaved = new CTM.InterleavedStream(vertices, 3);
  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);

  var gridIndices = this.readGridIndices(stream, vertices);

  CTM.restoreVertices(vertices, this.MG2Header, gridIndices, this.MG2Header.vertexPrecision);
};

CTM.ReaderMG2.prototype.readGridIndices = function (stream, vertices) {
  stream.readInt32(); // magic "GIDX"
  stream.readInt32(); // packed size

  var gridIndices = new Uint32Array(vertices.length / 3);

  var interleaved = new CTM.InterleavedStream(gridIndices, 1);
  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);

  CTM.restoreGridIndices(gridIndices, gridIndices.length);

  return gridIndices;
};

CTM.ReaderMG2.prototype.readIndices = function (stream, indices) {
  stream.readInt32(); // magic "INDX"
  stream.readInt32(); // packed size

  var interleaved = new CTM.InterleavedStream(indices, 3);
  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);

  CTM.restoreIndices(indices, indices.length);
};

CTM.ReaderMG2.prototype.readNormals = function (stream, body) {
  stream.readInt32(); // magic "NORM"
  stream.readInt32(); // packed size

  var interleaved = new CTM.InterleavedStream(body.normals, 3);
  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);

  var smooth = CTM.calcSmoothNormals(body.indices, body.vertices);

  CTM.restoreNormals(body.normals, smooth, this.MG2Header.normalPrecision);
};

CTM.ReaderMG2.prototype.readUVMaps = function (stream, uvMaps) {
  var i = 0;
  for (; i < uvMaps.length; ++i) {
    stream.readInt32(); // magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();

    var precision = stream.readFloat32();

    stream.readInt32(); // packed size

    var interleaved = new CTM.InterleavedStream(uvMaps[i].uv, 2);
    _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);

    CTM.restoreMap(uvMaps[i].uv, 2, precision);
  }
};

CTM.ReaderMG2.prototype.readAttrMaps = function (stream, attrMaps) {
  var i = 0;
  for (; i < attrMaps.length; ++i) {
    stream.readInt32(); // magic "ATTR"

    attrMaps[i].name = stream.readString();

    var precision = stream.readFloat32();

    stream.readInt32(); // packed size

    var interleaved = new CTM.InterleavedStream(attrMaps[i].attr, 4);
    _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);

    CTM.restoreMap(attrMaps[i].attr, 4, precision);
  }
};

CTM.restoreIndices = function (indices, len) {
  var i = 3;
  if (len > 0) {
    indices[2] += indices[0];
    indices[1] += indices[0];
  }
  for (; i < len; i += 3) {
    indices[i] += indices[i - 3];

    if (indices[i] === indices[i - 3]) {
      indices[i + 1] += indices[i - 2];
    } else {
      indices[i + 1] += indices[i];
    }

    indices[i + 2] += indices[i];
  }
};

CTM.restoreGridIndices = function (gridIndices, len) {
  var i = 1;
  for (; i < len; ++i) {
    gridIndices[i] += gridIndices[i - 1];
  }
};

CTM.restoreVertices = function (vertices, grid, gridIndices, precision) {
  var gridIdx,
      delta,
      x,
      y,
      z,
      intVertices = new Uint32Array(vertices.buffer, vertices.byteOffset, vertices.length),
      ydiv = grid.divx,
      zdiv = ydiv * grid.divy,
      prevGridIdx = 0x7fffffff,
      prevDelta = 0,
      i = 0,
      j = 0,
      len = gridIndices.length;

  for (; i < len; j += 3) {
    x = gridIdx = gridIndices[i++];

    z = ~ ~(x / zdiv);
    x -= ~ ~(z * zdiv);
    y = ~ ~(x / ydiv);
    x -= ~ ~(y * ydiv);

    delta = intVertices[j];
    if (gridIdx === prevGridIdx) {
      delta += prevDelta;
    }

    vertices[j] = grid.lowerBoundx + x * grid.sizex + precision * delta;
    vertices[j + 1] = grid.lowerBoundy + y * grid.sizey + precision * intVertices[j + 1];
    vertices[j + 2] = grid.lowerBoundz + z * grid.sizez + precision * intVertices[j + 2];

    prevGridIdx = gridIdx;
    prevDelta = delta;
  }
};

CTM.restoreNormals = function (normals, smooth, precision) {
  var ro,
      phi,
      theta,
      sinPhi,
      nx,
      ny,
      nz,
      by,
      bz,
      len,
      intNormals = new Uint32Array(normals.buffer, normals.byteOffset, normals.length),
      i = 0,
      k = normals.length,
      PI_DIV_2 = 3.141592653589793238462643 * 0.5;

  for (; i < k; i += 3) {
    ro = intNormals[i] * precision;
    phi = intNormals[i + 1];

    if (phi === 0) {
      normals[i] = smooth[i] * ro;
      normals[i + 1] = smooth[i + 1] * ro;
      normals[i + 2] = smooth[i + 2] * ro;
    } else {
      if (phi <= 4) {
        theta = (intNormals[i + 2] - 2) * PI_DIV_2;
      } else {
        theta = (intNormals[i + 2] * 4 / phi - 2) * PI_DIV_2;
      }

      phi *= precision * PI_DIV_2;
      sinPhi = ro * Math.sin(phi);

      nx = sinPhi * Math.cos(theta);
      ny = sinPhi * Math.sin(theta);
      nz = ro * Math.cos(phi);

      bz = smooth[i + 1];
      by = smooth[i] - smooth[i + 2];

      len = Math.sqrt(2 * bz * bz + by * by);
      if (len > 1e-20) {
        by /= len;
        bz /= len;
      }

      normals[i] = smooth[i] * nz + (smooth[i + 1] * bz - smooth[i + 2] * by) * ny - bz * nx;
      normals[i + 1] = smooth[i + 1] * nz - (smooth[i + 2] + smooth[i]) * bz * ny + by * nx;
      normals[i + 2] = smooth[i + 2] * nz + (smooth[i] * by + smooth[i + 1] * bz) * ny + bz * nx;
    }
  }
};

CTM.restoreMap = function (map, count, precision) {
  var delta,
      value,
      intMap = new Uint32Array(map.buffer, map.byteOffset, map.length),
      i = 0,
      j,
      len = map.length;

  for (; i < count; ++i) {
    delta = 0;

    for (j = i; j < len; j += count) {
      value = intMap[j];

      delta += value & 1 ? -(value + 1 >> 1) : value >> 1;

      map[j] = delta * precision;
    }
  }
};

CTM.calcSmoothNormals = function (indices, vertices) {
  var smooth = new Float32Array(vertices.length),
      indx,
      indy,
      indz,
      nx,
      ny,
      nz,
      v1x,
      v1y,
      v1z,
      v2x,
      v2y,
      v2z,
      len,
      i,
      k;

  for (i = 0, k = indices.length; i < k;) {
    indx = indices[i++] * 3;
    indy = indices[i++] * 3;
    indz = indices[i++] * 3;

    v1x = vertices[indy] - vertices[indx];
    v2x = vertices[indz] - vertices[indx];
    v1y = vertices[indy + 1] - vertices[indx + 1];
    v2y = vertices[indz + 1] - vertices[indx + 1];
    v1z = vertices[indy + 2] - vertices[indx + 2];
    v2z = vertices[indz + 2] - vertices[indx + 2];

    nx = v1y * v2z - v1z * v2y;
    ny = v1z * v2x - v1x * v2z;
    nz = v1x * v2y - v1y * v2x;

    len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 1e-10) {
      nx /= len;
      ny /= len;
      nz /= len;
    }

    smooth[indx] += nx;
    smooth[indx + 1] += ny;
    smooth[indx + 2] += nz;
    smooth[indy] += nx;
    smooth[indy + 1] += ny;
    smooth[indy + 2] += nz;
    smooth[indz] += nx;
    smooth[indz + 1] += ny;
    smooth[indz + 2] += nz;
  }

  for (i = 0, k = smooth.length; i < k; i += 3) {
    len = Math.sqrt(smooth[i] * smooth[i] + smooth[i + 1] * smooth[i + 1] + smooth[i + 2] * smooth[i + 2]);

    if (len > 1e-10) {
      smooth[i] /= len;
      smooth[i + 1] /= len;
      smooth[i + 2] /= len;
    }
  }

  return smooth;
};

CTM.isLittleEndian = (function () {
  var buffer = new ArrayBuffer(2),
      bytes = new Uint8Array(buffer),
      ints = new Uint16Array(buffer);

  bytes[0] = 1;

  return ints[0] === 1;
})();

CTM.InterleavedStream = function (data, count) {
  this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  this.offset = CTM.isLittleEndian ? 3 : 0;
  this.count = count * 4;
  this.len = this.data.length;
};

CTM.InterleavedStream.prototype.writeByte = function (value) {
  this.data[this.offset] = value;

  this.offset += this.count;
  if (this.offset >= this.len) {
    this.offset -= this.len - 4;
    if (this.offset >= this.count) {
      this.offset -= this.count + (CTM.isLittleEndian ? 1 : -1);
    }
  }
};

CTM.Stream = function (data) {
  this.data = data;
  this.offset = 0;
};

CTM.Stream.prototype.TWO_POW_MINUS23 = Math.pow(2, -23);

CTM.Stream.prototype.TWO_POW_MINUS126 = Math.pow(2, -126);

CTM.Stream.prototype.readByte = function () {
  return this.data[this.offset++] & 0xff;
};

CTM.Stream.prototype.readInt32 = function () {
  var i = this.readByte();
  i |= this.readByte() << 8;
  i |= this.readByte() << 16;
  return i | this.readByte() << 24;
};

CTM.Stream.prototype.readFloat32 = function () {
  var m = this.readByte();
  m += this.readByte() << 8;

  var b1 = this.readByte();
  var b2 = this.readByte();

  m += (b1 & 0x7f) << 16;
  var e = (b2 & 0x7f) << 1 | (b1 & 0x80) >>> 7;
  var s = b2 & 0x80 ? -1 : 1;

  if (e === 255) {
    return m !== 0 ? NaN : s * Infinity;
  }
  if (e > 0) {
    return s * (1 + m * this.TWO_POW_MINUS23) * Math.pow(2, e - 127);
  }
  if (m !== 0) {
    return s * m * this.TWO_POW_MINUS126;
  }
  return s * 0;
};

CTM.Stream.prototype.readString = function () {
  var len = this.readInt32();

  this.offset += len;

  return String.fromCharCode.apply(null, this.data.subarray(this.offset - len, this.offset));
};

CTM.Stream.prototype.readArrayInt32 = function (array) {
  var i = 0,
      len = array.length;

  while (i < len) {
    array[i++] = this.readInt32();
  }

  return array;
};

CTM.Stream.prototype.readArrayFloat32 = function (array) {
  var i = 0,
      len = array.length;

  while (i < len) {
    array[i++] = this.readFloat32();
  }

  return array;
};

exports.default = CTM;

},{"./lzma":6}],5:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inputDataType = exports.outputs = undefined;
exports.default = parse;

var _compositeDetect = require('composite-detect');

var _compositeDetect2 = _interopRequireDefault(_compositeDetect);

var _assign = require('fast.js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _rx = typeof window !== "undefined" ? window['Rx'] : typeof global !== "undefined" ? global['Rx'] : null;

var _rx2 = _interopRequireDefault(_rx);

var _ctm = require('./ctm');

var _ctm2 = _interopRequireDefault(_ctm);

var _utils = require('./utils');

var _parseHelpers = require('./parseHelpers');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// import {parseSteps} from './parseHelpers'

/**
 * Loader for CTM encoded models generated by OpenCTM tools:
 *	http://openctm.sourceforge.net/
 *
 * Uses js-openctm library by Juan Mellado
 *	http://code.google.com/p/js-openctm/
 *
 * @author alteredq / http://alteredqualia.com/
 * heavilly modified by kaosat-dev
 */

var outputs = exports.outputs = ['geometry']; // to be able to auto determine data type(s) fetched by parser
var inputDataType = exports.inputDataType = 'arrayBuffer'; // to be able to set required input data type

// Load CTM compressed models
function parse(data) {
  var parameters = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var defaults = {
    useWorker: _compositeDetect2.default.isBrowser === true,
    offsets: [0]
  };
  parameters = (0, _assign2.default)({}, defaults, parameters);

  var _parameters = parameters;
  var useWorker = _parameters.useWorker;
  var offsets = _parameters.offsets;

  var obs = new _rx2.default.ReplaySubject(1);

  var length = 0;
  data = (0, _utils.ensureArrayBuffer)(data);

  var binaryData = new Uint8Array(data);
  var result = null;

  // var binaryData = new Uint8Array(data)
  // var binaryData = new Uint8Array( new ArrayBuffer(data) )
  // var binaryData = new Buffer( new Uint8Array(data) )

  // TODO: this is only temporary for NODE.js side
  // var data = toArrayBuffer(data)

  if (useWorker) {
    (function () {
      // let Worker = require("./worker.js");//Webpack worker!
      // var worker = new Worker

      var worker = new Worker(window.URL.createObjectURL(new Blob(['(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module \'"+o+"\'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n\'use strict\';\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\n\nvar _lzma = require(\'./lzma\');\n\nvar _lzma2 = _interopRequireDefault(_lzma);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar CTM = CTM || {}; /*\n                     Copyright (c) 2011 Juan Mellado\n                     \n                     Permission is hereby granted, free of charge, to any person obtaining a copy\n                     of this software and associated documentation files (the "Software"), to deal\n                     in the Software without restriction, including without limitation the rights\n                     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n                     copies of the Software, and to permit persons to whom the Software is\n                     furnished to do so, subject to the following conditions:\n                     \n                     The above copyright notice and this permission notice shall be included in\n                     all copies or substantial portions of the Software.\n                     \n                     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n                     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n                     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n                     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n                     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n                     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n                     THE SOFTWARE.\n                     */\n\n/*\nReferences:\n- "OpenCTM: The Open Compressed Triangle Mesh file format" by Marcus Geelnard\n  http://openctm.sourceforge.net/\n*/\n\nCTM.CompressionMethod = {\n  RAW: 0x00574152,\n  MG1: 0x0031474d,\n  MG2: 0x0032474d\n};\n\nCTM.Flags = {\n  NORMALS: 0x00000001\n};\n\nCTM.File = function (stream) {\n  this.load(stream);\n};\n\nCTM.File.prototype.load = function (stream) {\n  this.header = new CTM.FileHeader(stream);\n  this.body = new CTM.FileBody(this.header);\n\n  this.getReader().read(stream, this.body);\n  /*  var reader = this.getReader()\n    reader.read(stream, this.body);*/\n};\n\nCTM.File.prototype.getReader = function () {\n  var reader;\n\n  switch (this.header.compressionMethod) {\n    case CTM.CompressionMethod.RAW:\n      reader = new CTM.ReaderRAW();\n      break;\n    case CTM.CompressionMethod.MG1:\n      reader = new CTM.ReaderMG1();\n      break;\n    case CTM.CompressionMethod.MG2:\n      reader = new CTM.ReaderMG2();\n      break;\n  }\n\n  return reader;\n};\n\nCTM.FileHeader = function (stream) {\n  stream.readInt32(); // magic "OCTM"\n  this.fileFormat = stream.readInt32();\n  this.compressionMethod = stream.readInt32();\n  this.vertexCount = stream.readInt32();\n  this.triangleCount = stream.readInt32();\n  this.uvMapCount = stream.readInt32();\n  this.attrMapCount = stream.readInt32();\n  this.flags = stream.readInt32();\n  this.comment = stream.readString();\n};\n\nCTM.FileHeader.prototype.hasNormals = function () {\n  return this.flags & CTM.Flags.NORMALS;\n};\n\nCTM.FileBody = function (header) {\n  var i = header.triangleCount * 3,\n      v = header.vertexCount * 3,\n      n = header.hasNormals() ? header.vertexCount * 3 : 0,\n      u = header.vertexCount * 2,\n      a = header.vertexCount * 4,\n      j = 0;\n\n  var data = new ArrayBuffer((i + v + n + u * header.uvMapCount + a * header.attrMapCount) * 4);\n\n  this.indices = new Uint32Array(data, 0, i);\n\n  this.vertices = new Float32Array(data, i * 4, v);\n\n  if (header.hasNormals()) {\n    this.normals = new Float32Array(data, (i + v) * 4, n);\n  }\n\n  if (header.uvMapCount) {\n    this.uvMaps = [];\n    for (j = 0; j < header.uvMapCount; ++j) {\n      this.uvMaps[j] = { uv: new Float32Array(data, (i + v + n + j * u) * 4, u) };\n    }\n  }\n\n  if (header.attrMapCount) {\n    this.attrMaps = [];\n    for (j = 0; j < header.attrMapCount; ++j) {\n      this.attrMaps[j] = { attr: new Float32Array(data, (i + v + n + u * header.uvMapCount + j * a) * 4, a) };\n    }\n  }\n};\n\nCTM.FileMG2Header = function (stream) {\n  stream.readInt32(); // magic "MG2H"\n  this.vertexPrecision = stream.readFloat32();\n  this.normalPrecision = stream.readFloat32();\n  this.lowerBoundx = stream.readFloat32();\n  this.lowerBoundy = stream.readFloat32();\n  this.lowerBoundz = stream.readFloat32();\n  this.higherBoundx = stream.readFloat32();\n  this.higherBoundy = stream.readFloat32();\n  this.higherBoundz = stream.readFloat32();\n  this.divx = stream.readInt32();\n  this.divy = stream.readInt32();\n  this.divz = stream.readInt32();\n\n  this.sizex = (this.higherBoundx - this.lowerBoundx) / this.divx;\n  this.sizey = (this.higherBoundy - this.lowerBoundy) / this.divy;\n  this.sizez = (this.higherBoundz - this.lowerBoundz) / this.divz;\n};\n\nCTM.ReaderRAW = function () {};\n\nCTM.ReaderRAW.prototype.read = function (stream, body) {\n  this.readIndices(stream, body.indices);\n  this.readVertices(stream, body.vertices);\n\n  if (body.normals) {\n    this.readNormals(stream, body.normals);\n  }\n  if (body.uvMaps) {\n    this.readUVMaps(stream, body.uvMaps);\n  }\n  if (body.attrMaps) {\n    this.readAttrMaps(stream, body.attrMaps);\n  }\n};\n\nCTM.ReaderRAW.prototype.readIndices = function (stream, indices) {\n  stream.readInt32(); // magic "INDX"\n  stream.readArrayInt32(indices);\n};\n\nCTM.ReaderRAW.prototype.readVertices = function (stream, vertices) {\n  stream.readInt32(); // magic "VERT"\n  stream.readArrayFloat32(vertices);\n};\n\nCTM.ReaderRAW.prototype.readNormals = function (stream, normals) {\n  stream.readInt32(); // magic "NORM"\n  stream.readArrayFloat32(normals);\n};\n\nCTM.ReaderRAW.prototype.readUVMaps = function (stream, uvMaps) {\n  var i = 0;\n  for (; i < uvMaps.length; ++i) {\n    stream.readInt32(); // magic "TEXC"\n\n    uvMaps[i].name = stream.readString();\n    uvMaps[i].filename = stream.readString();\n    stream.readArrayFloat32(uvMaps[i].uv);\n  }\n};\n\nCTM.ReaderRAW.prototype.readAttrMaps = function (stream, attrMaps) {\n  var i = 0;\n  for (; i < attrMaps.length; ++i) {\n    stream.readInt32(); // magic "ATTR"\n\n    attrMaps[i].name = stream.readString();\n    stream.readArrayFloat32(attrMaps[i].attr);\n  }\n};\n\nCTM.ReaderMG1 = function () {};\n\nCTM.ReaderMG1.prototype.read = function (stream, body) {\n  this.readIndices(stream, body.indices);\n  this.readVertices(stream, body.vertices);\n\n  if (body.normals) {\n    this.readNormals(stream, body.normals);\n  }\n  if (body.uvMaps) {\n    this.readUVMaps(stream, body.uvMaps);\n  }\n  if (body.attrMaps) {\n    this.readAttrMaps(stream, body.attrMaps);\n  }\n};\n\nCTM.ReaderMG1.prototype.readIndices = function (stream, indices) {\n  stream.readInt32(); // magic "INDX"\n  stream.readInt32(); // packed size\n\n  var interleaved = new CTM.InterleavedStream(indices, 3);\n  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);\n\n  CTM.restoreIndices(indices, indices.length);\n};\n\nCTM.ReaderMG1.prototype.readVertices = function (stream, vertices) {\n  stream.readInt32(); // magic "VERT"\n  stream.readInt32(); // packed size\n\n  var interleaved = new CTM.InterleavedStream(vertices, 1);\n  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);\n};\n\nCTM.ReaderMG1.prototype.readNormals = function (stream, normals) {\n  stream.readInt32(); // magic "NORM"\n  stream.readInt32(); // packed size\n\n  var interleaved = new CTM.InterleavedStream(normals, 3);\n  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);\n};\n\nCTM.ReaderMG1.prototype.readUVMaps = function (stream, uvMaps) {\n  var i = 0;\n  for (; i < uvMaps.length; ++i) {\n    stream.readInt32(); // magic "TEXC"\n\n    uvMaps[i].name = stream.readString();\n    uvMaps[i].filename = stream.readString();\n\n    stream.readInt32(); // packed size\n\n    var interleaved = new CTM.InterleavedStream(uvMaps[i].uv, 2);\n    _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);\n  }\n};\n\nCTM.ReaderMG1.prototype.readAttrMaps = function (stream, attrMaps) {\n  var i = 0;\n  for (; i < attrMaps.length; ++i) {\n    stream.readInt32(); // magic "ATTR"\n\n    attrMaps[i].name = stream.readString();\n\n    stream.readInt32(); // packed size\n\n    var interleaved = new CTM.InterleavedStream(attrMaps[i].attr, 4);\n    _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);\n  }\n};\n\nCTM.ReaderMG2 = function () {};\n\nCTM.ReaderMG2.prototype.read = function (stream, body) {\n  this.MG2Header = new CTM.FileMG2Header(stream);\n\n  this.readVertices(stream, body.vertices);\n  this.readIndices(stream, body.indices);\n\n  if (body.normals) {\n    this.readNormals(stream, body);\n  }\n  if (body.uvMaps) {\n    this.readUVMaps(stream, body.uvMaps);\n  }\n  if (body.attrMaps) {\n    this.readAttrMaps(stream, body.attrMaps);\n  }\n};\n\nCTM.ReaderMG2.prototype.readVertices = function (stream, vertices) {\n  stream.readInt32(); // magic "VERT"\n  stream.readInt32(); // packed size\n\n  var interleaved = new CTM.InterleavedStream(vertices, 3);\n  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);\n\n  var gridIndices = this.readGridIndices(stream, vertices);\n\n  CTM.restoreVertices(vertices, this.MG2Header, gridIndices, this.MG2Header.vertexPrecision);\n};\n\nCTM.ReaderMG2.prototype.readGridIndices = function (stream, vertices) {\n  stream.readInt32(); // magic "GIDX"\n  stream.readInt32(); // packed size\n\n  var gridIndices = new Uint32Array(vertices.length / 3);\n\n  var interleaved = new CTM.InterleavedStream(gridIndices, 1);\n  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);\n\n  CTM.restoreGridIndices(gridIndices, gridIndices.length);\n\n  return gridIndices;\n};\n\nCTM.ReaderMG2.prototype.readIndices = function (stream, indices) {\n  stream.readInt32(); // magic "INDX"\n  stream.readInt32(); // packed size\n\n  var interleaved = new CTM.InterleavedStream(indices, 3);\n  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);\n\n  CTM.restoreIndices(indices, indices.length);\n};\n\nCTM.ReaderMG2.prototype.readNormals = function (stream, body) {\n  stream.readInt32(); // magic "NORM"\n  stream.readInt32(); // packed size\n\n  var interleaved = new CTM.InterleavedStream(body.normals, 3);\n  _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);\n\n  var smooth = CTM.calcSmoothNormals(body.indices, body.vertices);\n\n  CTM.restoreNormals(body.normals, smooth, this.MG2Header.normalPrecision);\n};\n\nCTM.ReaderMG2.prototype.readUVMaps = function (stream, uvMaps) {\n  var i = 0;\n  for (; i < uvMaps.length; ++i) {\n    stream.readInt32(); // magic "TEXC"\n\n    uvMaps[i].name = stream.readString();\n    uvMaps[i].filename = stream.readString();\n\n    var precision = stream.readFloat32();\n\n    stream.readInt32(); // packed size\n\n    var interleaved = new CTM.InterleavedStream(uvMaps[i].uv, 2);\n    _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);\n\n    CTM.restoreMap(uvMaps[i].uv, 2, precision);\n  }\n};\n\nCTM.ReaderMG2.prototype.readAttrMaps = function (stream, attrMaps) {\n  var i = 0;\n  for (; i < attrMaps.length; ++i) {\n    stream.readInt32(); // magic "ATTR"\n\n    attrMaps[i].name = stream.readString();\n\n    var precision = stream.readFloat32();\n\n    stream.readInt32(); // packed size\n\n    var interleaved = new CTM.InterleavedStream(attrMaps[i].attr, 4);\n    _lzma2.default.decompress(stream, stream, interleaved, interleaved.data.length);\n\n    CTM.restoreMap(attrMaps[i].attr, 4, precision);\n  }\n};\n\nCTM.restoreIndices = function (indices, len) {\n  var i = 3;\n  if (len > 0) {\n    indices[2] += indices[0];\n    indices[1] += indices[0];\n  }\n  for (; i < len; i += 3) {\n    indices[i] += indices[i - 3];\n\n    if (indices[i] === indices[i - 3]) {\n      indices[i + 1] += indices[i - 2];\n    } else {\n      indices[i + 1] += indices[i];\n    }\n\n    indices[i + 2] += indices[i];\n  }\n};\n\nCTM.restoreGridIndices = function (gridIndices, len) {\n  var i = 1;\n  for (; i < len; ++i) {\n    gridIndices[i] += gridIndices[i - 1];\n  }\n};\n\nCTM.restoreVertices = function (vertices, grid, gridIndices, precision) {\n  var gridIdx,\n      delta,\n      x,\n      y,\n      z,\n      intVertices = new Uint32Array(vertices.buffer, vertices.byteOffset, vertices.length),\n      ydiv = grid.divx,\n      zdiv = ydiv * grid.divy,\n      prevGridIdx = 0x7fffffff,\n      prevDelta = 0,\n      i = 0,\n      j = 0,\n      len = gridIndices.length;\n\n  for (; i < len; j += 3) {\n    x = gridIdx = gridIndices[i++];\n\n    z = ~ ~(x / zdiv);\n    x -= ~ ~(z * zdiv);\n    y = ~ ~(x / ydiv);\n    x -= ~ ~(y * ydiv);\n\n    delta = intVertices[j];\n    if (gridIdx === prevGridIdx) {\n      delta += prevDelta;\n    }\n\n    vertices[j] = grid.lowerBoundx + x * grid.sizex + precision * delta;\n    vertices[j + 1] = grid.lowerBoundy + y * grid.sizey + precision * intVertices[j + 1];\n    vertices[j + 2] = grid.lowerBoundz + z * grid.sizez + precision * intVertices[j + 2];\n\n    prevGridIdx = gridIdx;\n    prevDelta = delta;\n  }\n};\n\nCTM.restoreNormals = function (normals, smooth, precision) {\n  var ro,\n      phi,\n      theta,\n      sinPhi,\n      nx,\n      ny,\n      nz,\n      by,\n      bz,\n      len,\n      intNormals = new Uint32Array(normals.buffer, normals.byteOffset, normals.length),\n      i = 0,\n      k = normals.length,\n      PI_DIV_2 = 3.141592653589793238462643 * 0.5;\n\n  for (; i < k; i += 3) {\n    ro = intNormals[i] * precision;\n    phi = intNormals[i + 1];\n\n    if (phi === 0) {\n      normals[i] = smooth[i] * ro;\n      normals[i + 1] = smooth[i + 1] * ro;\n      normals[i + 2] = smooth[i + 2] * ro;\n    } else {\n      if (phi <= 4) {\n        theta = (intNormals[i + 2] - 2) * PI_DIV_2;\n      } else {\n        theta = (intNormals[i + 2] * 4 / phi - 2) * PI_DIV_2;\n      }\n\n      phi *= precision * PI_DIV_2;\n      sinPhi = ro * Math.sin(phi);\n\n      nx = sinPhi * Math.cos(theta);\n      ny = sinPhi * Math.sin(theta);\n      nz = ro * Math.cos(phi);\n\n      bz = smooth[i + 1];\n      by = smooth[i] - smooth[i + 2];\n\n      len = Math.sqrt(2 * bz * bz + by * by);\n      if (len > 1e-20) {\n        by /= len;\n        bz /= len;\n      }\n\n      normals[i] = smooth[i] * nz + (smooth[i + 1] * bz - smooth[i + 2] * by) * ny - bz * nx;\n      normals[i + 1] = smooth[i + 1] * nz - (smooth[i + 2] + smooth[i]) * bz * ny + by * nx;\n      normals[i + 2] = smooth[i + 2] * nz + (smooth[i] * by + smooth[i + 1] * bz) * ny + bz * nx;\n    }\n  }\n};\n\nCTM.restoreMap = function (map, count, precision) {\n  var delta,\n      value,\n      intMap = new Uint32Array(map.buffer, map.byteOffset, map.length),\n      i = 0,\n      j,\n      len = map.length;\n\n  for (; i < count; ++i) {\n    delta = 0;\n\n    for (j = i; j < len; j += count) {\n      value = intMap[j];\n\n      delta += value & 1 ? -(value + 1 >> 1) : value >> 1;\n\n      map[j] = delta * precision;\n    }\n  }\n};\n\nCTM.calcSmoothNormals = function (indices, vertices) {\n  var smooth = new Float32Array(vertices.length),\n      indx,\n      indy,\n      indz,\n      nx,\n      ny,\n      nz,\n      v1x,\n      v1y,\n      v1z,\n      v2x,\n      v2y,\n      v2z,\n      len,\n      i,\n      k;\n\n  for (i = 0, k = indices.length; i < k;) {\n    indx = indices[i++] * 3;\n    indy = indices[i++] * 3;\n    indz = indices[i++] * 3;\n\n    v1x = vertices[indy] - vertices[indx];\n    v2x = vertices[indz] - vertices[indx];\n    v1y = vertices[indy + 1] - vertices[indx + 1];\n    v2y = vertices[indz + 1] - vertices[indx + 1];\n    v1z = vertices[indy + 2] - vertices[indx + 2];\n    v2z = vertices[indz + 2] - vertices[indx + 2];\n\n    nx = v1y * v2z - v1z * v2y;\n    ny = v1z * v2x - v1x * v2z;\n    nz = v1x * v2y - v1y * v2x;\n\n    len = Math.sqrt(nx * nx + ny * ny + nz * nz);\n    if (len > 1e-10) {\n      nx /= len;\n      ny /= len;\n      nz /= len;\n    }\n\n    smooth[indx] += nx;\n    smooth[indx + 1] += ny;\n    smooth[indx + 2] += nz;\n    smooth[indy] += nx;\n    smooth[indy + 1] += ny;\n    smooth[indy + 2] += nz;\n    smooth[indz] += nx;\n    smooth[indz + 1] += ny;\n    smooth[indz + 2] += nz;\n  }\n\n  for (i = 0, k = smooth.length; i < k; i += 3) {\n    len = Math.sqrt(smooth[i] * smooth[i] + smooth[i + 1] * smooth[i + 1] + smooth[i + 2] * smooth[i + 2]);\n\n    if (len > 1e-10) {\n      smooth[i] /= len;\n      smooth[i + 1] /= len;\n      smooth[i + 2] /= len;\n    }\n  }\n\n  return smooth;\n};\n\nCTM.isLittleEndian = (function () {\n  var buffer = new ArrayBuffer(2),\n      bytes = new Uint8Array(buffer),\n      ints = new Uint16Array(buffer);\n\n  bytes[0] = 1;\n\n  return ints[0] === 1;\n})();\n\nCTM.InterleavedStream = function (data, count) {\n  this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);\n  this.offset = CTM.isLittleEndian ? 3 : 0;\n  this.count = count * 4;\n  this.len = this.data.length;\n};\n\nCTM.InterleavedStream.prototype.writeByte = function (value) {\n  this.data[this.offset] = value;\n\n  this.offset += this.count;\n  if (this.offset >= this.len) {\n    this.offset -= this.len - 4;\n    if (this.offset >= this.count) {\n      this.offset -= this.count + (CTM.isLittleEndian ? 1 : -1);\n    }\n  }\n};\n\nCTM.Stream = function (data) {\n  this.data = data;\n  this.offset = 0;\n};\n\nCTM.Stream.prototype.TWO_POW_MINUS23 = Math.pow(2, -23);\n\nCTM.Stream.prototype.TWO_POW_MINUS126 = Math.pow(2, -126);\n\nCTM.Stream.prototype.readByte = function () {\n  return this.data[this.offset++] & 0xff;\n};\n\nCTM.Stream.prototype.readInt32 = function () {\n  var i = this.readByte();\n  i |= this.readByte() << 8;\n  i |= this.readByte() << 16;\n  return i | this.readByte() << 24;\n};\n\nCTM.Stream.prototype.readFloat32 = function () {\n  var m = this.readByte();\n  m += this.readByte() << 8;\n\n  var b1 = this.readByte();\n  var b2 = this.readByte();\n\n  m += (b1 & 0x7f) << 16;\n  var e = (b2 & 0x7f) << 1 | (b1 & 0x80) >>> 7;\n  var s = b2 & 0x80 ? -1 : 1;\n\n  if (e === 255) {\n    return m !== 0 ? NaN : s * Infinity;\n  }\n  if (e > 0) {\n    return s * (1 + m * this.TWO_POW_MINUS23) * Math.pow(2, e - 127);\n  }\n  if (m !== 0) {\n    return s * m * this.TWO_POW_MINUS126;\n  }\n  return s * 0;\n};\n\nCTM.Stream.prototype.readString = function () {\n  var len = this.readInt32();\n\n  this.offset += len;\n\n  return String.fromCharCode.apply(null, this.data.subarray(this.offset - len, this.offset));\n};\n\nCTM.Stream.prototype.readArrayInt32 = function (array) {\n  var i = 0,\n      len = array.length;\n\n  while (i < len) {\n    array[i++] = this.readInt32();\n  }\n\n  return array;\n};\n\nCTM.Stream.prototype.readArrayFloat32 = function (array) {\n  var i = 0,\n      len = array.length;\n\n  while (i < len) {\n    array[i++] = this.readFloat32();\n  }\n\n  return array;\n};\n\nexports.default = CTM;\n\n},{"./lzma":2}],2:[function(require,module,exports){\n\'use strict\';\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nvar LZMA = LZMA || {};\n\nLZMA.OutWindow = function () {\n  this._windowSize = 0;\n};\n\nLZMA.OutWindow.prototype.create = function (windowSize) {\n  if (!this._buffer || this._windowSize !== windowSize) {\n    this._buffer = [];\n  }\n  this._windowSize = windowSize;\n  this._pos = 0;\n  this._streamPos = 0;\n};\n\nLZMA.OutWindow.prototype.flush = function () {\n  var size = this._pos - this._streamPos;\n  if (size !== 0) {\n    while (size--) {\n      this._stream.writeByte(this._buffer[this._streamPos++]);\n    }\n    if (this._pos >= this._windowSize) {\n      this._pos = 0;\n    }\n    this._streamPos = this._pos;\n  }\n};\n\nLZMA.OutWindow.prototype.releaseStream = function () {\n  this.flush();\n  this._stream = null;\n};\n\nLZMA.OutWindow.prototype.setStream = function (stream) {\n  this.releaseStream();\n  this._stream = stream;\n};\n\nLZMA.OutWindow.prototype.init = function (solid) {\n  if (!solid) {\n    this._streamPos = 0;\n    this._pos = 0;\n  }\n};\n\nLZMA.OutWindow.prototype.copyBlock = function (distance, len) {\n  var pos = this._pos - distance - 1;\n  if (pos < 0) {\n    pos += this._windowSize;\n  }\n  while (len--) {\n    if (pos >= this._windowSize) {\n      pos = 0;\n    }\n    this._buffer[this._pos++] = this._buffer[pos++];\n    if (this._pos >= this._windowSize) {\n      this.flush();\n    }\n  }\n};\n\nLZMA.OutWindow.prototype.putByte = function (b) {\n  this._buffer[this._pos++] = b;\n  if (this._pos >= this._windowSize) {\n    this.flush();\n  }\n};\n\nLZMA.OutWindow.prototype.getByte = function (distance) {\n  var pos = this._pos - distance - 1;\n  if (pos < 0) {\n    pos += this._windowSize;\n  }\n  return this._buffer[pos];\n};\n\nLZMA.RangeDecoder = function () {};\n\nLZMA.RangeDecoder.prototype.setStream = function (stream) {\n  this._stream = stream;\n};\n\nLZMA.RangeDecoder.prototype.releaseStream = function () {\n  this._stream = null;\n};\n\nLZMA.RangeDecoder.prototype.init = function () {\n  var i = 5;\n\n  this._code = 0;\n  this._range = -1;\n\n  while (i--) {\n    this._code = this._code << 8 | this._stream.readByte();\n  }\n};\n\nLZMA.RangeDecoder.prototype.decodeDirectBits = function (numTotalBits) {\n  var result = 0,\n      i = numTotalBits,\n      t;\n\n  while (i--) {\n    this._range >>>= 1;\n    t = this._code - this._range >>> 31;\n    this._code -= this._range & t - 1;\n    result = result << 1 | 1 - t;\n\n    if ((this._range & 0xff000000) === 0) {\n      this._code = this._code << 8 | this._stream.readByte();\n      this._range <<= 8;\n    }\n  }\n\n  return result;\n};\n\nLZMA.RangeDecoder.prototype.decodeBit = function (probs, index) {\n  var prob = probs[index],\n      newBound = (this._range >>> 11) * prob;\n\n  if ((this._code ^ 0x80000000) < (newBound ^ 0x80000000)) {\n    this._range = newBound;\n    probs[index] += 2048 - prob >>> 5;\n    if ((this._range & 0xff000000) === 0) {\n      this._code = this._code << 8 | this._stream.readByte();\n      this._range <<= 8;\n    }\n    return 0;\n  }\n\n  this._range -= newBound;\n  this._code -= newBound;\n  probs[index] -= prob >>> 5;\n  if ((this._range & 0xff000000) === 0) {\n    this._code = this._code << 8 | this._stream.readByte();\n    this._range <<= 8;\n  }\n  return 1;\n};\n\nLZMA.initBitModels = function (probs, len) {\n  while (len--) {\n    probs[len] = 1024;\n  }\n};\n\nLZMA.BitTreeDecoder = function (numBitLevels) {\n  this._models = [];\n  this._numBitLevels = numBitLevels;\n};\n\nLZMA.BitTreeDecoder.prototype.init = function () {\n  LZMA.initBitModels(this._models, 1 << this._numBitLevels);\n};\n\nLZMA.BitTreeDecoder.prototype.decode = function (rangeDecoder) {\n  var m = 1,\n      i = this._numBitLevels;\n\n  while (i--) {\n    m = m << 1 | rangeDecoder.decodeBit(this._models, m);\n  }\n  return m - (1 << this._numBitLevels);\n};\n\nLZMA.BitTreeDecoder.prototype.reverseDecode = function (rangeDecoder) {\n  var m = 1,\n      symbol = 0,\n      i = 0,\n      bit;\n\n  for (; i < this._numBitLevels; ++i) {\n    bit = rangeDecoder.decodeBit(this._models, m);\n    m = m << 1 | bit;\n    symbol |= bit << i;\n  }\n  return symbol;\n};\n\nLZMA.reverseDecode2 = function (models, startIndex, rangeDecoder, numBitLevels) {\n  var m = 1,\n      symbol = 0,\n      i = 0,\n      bit;\n\n  for (; i < numBitLevels; ++i) {\n    bit = rangeDecoder.decodeBit(models, startIndex + m);\n    m = m << 1 | bit;\n    symbol |= bit << i;\n  }\n  return symbol;\n};\n\nLZMA.LenDecoder = function () {\n  this._choice = [];\n  this._lowCoder = [];\n  this._midCoder = [];\n  this._highCoder = new LZMA.BitTreeDecoder(8);\n  this._numPosStates = 0;\n};\n\nLZMA.LenDecoder.prototype.create = function (numPosStates) {\n  for (; this._numPosStates < numPosStates; ++this._numPosStates) {\n    this._lowCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);\n    this._midCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);\n  }\n};\n\nLZMA.LenDecoder.prototype.init = function () {\n  var i = this._numPosStates;\n  LZMA.initBitModels(this._choice, 2);\n  while (i--) {\n    this._lowCoder[i].init();\n    this._midCoder[i].init();\n  }\n  this._highCoder.init();\n};\n\nLZMA.LenDecoder.prototype.decode = function (rangeDecoder, posState) {\n  if (rangeDecoder.decodeBit(this._choice, 0) === 0) {\n    return this._lowCoder[posState].decode(rangeDecoder);\n  }\n  if (rangeDecoder.decodeBit(this._choice, 1) === 0) {\n    return 8 + this._midCoder[posState].decode(rangeDecoder);\n  }\n  return 16 + this._highCoder.decode(rangeDecoder);\n};\n\nLZMA.Decoder2 = function () {\n  this._decoders = [];\n};\n\nLZMA.Decoder2.prototype.init = function () {\n  LZMA.initBitModels(this._decoders, 0x300);\n};\n\nLZMA.Decoder2.prototype.decodeNormal = function (rangeDecoder) {\n  var symbol = 1;\n\n  do {\n    symbol = symbol << 1 | rangeDecoder.decodeBit(this._decoders, symbol);\n  } while (symbol < 0x100);\n\n  return symbol & 0xff;\n};\n\nLZMA.Decoder2.prototype.decodeWithMatchByte = function (rangeDecoder, matchByte) {\n  var symbol = 1,\n      matchBit,\n      bit;\n\n  do {\n    matchBit = matchByte >> 7 & 1;\n    matchByte <<= 1;\n    bit = rangeDecoder.decodeBit(this._decoders, (1 + matchBit << 8) + symbol);\n    symbol = symbol << 1 | bit;\n    if (matchBit !== bit) {\n      while (symbol < 0x100) {\n        symbol = symbol << 1 | rangeDecoder.decodeBit(this._decoders, symbol);\n      }\n      break;\n    }\n  } while (symbol < 0x100);\n\n  return symbol & 0xff;\n};\n\nLZMA.LiteralDecoder = function () {};\n\nLZMA.LiteralDecoder.prototype.create = function (numPosBits, numPrevBits) {\n  var i;\n\n  if (this._coders && this._numPrevBits === numPrevBits && this._numPosBits === numPosBits) {\n    return;\n  }\n  this._numPosBits = numPosBits;\n  this._posMask = (1 << numPosBits) - 1;\n  this._numPrevBits = numPrevBits;\n\n  this._coders = [];\n\n  i = 1 << this._numPrevBits + this._numPosBits;\n  while (i--) {\n    this._coders[i] = new LZMA.Decoder2();\n  }\n};\n\nLZMA.LiteralDecoder.prototype.init = function () {\n  var i = 1 << this._numPrevBits + this._numPosBits;\n  while (i--) {\n    this._coders[i].init();\n  }\n};\n\nLZMA.LiteralDecoder.prototype.getDecoder = function (pos, prevByte) {\n  return this._coders[((pos & this._posMask) << this._numPrevBits) + ((prevByte & 0xff) >>> 8 - this._numPrevBits)];\n};\n\nLZMA.Decoder = function () {\n  this._outWindow = new LZMA.OutWindow();\n  this._rangeDecoder = new LZMA.RangeDecoder();\n  this._isMatchDecoders = [];\n  this._isRepDecoders = [];\n  this._isRepG0Decoders = [];\n  this._isRepG1Decoders = [];\n  this._isRepG2Decoders = [];\n  this._isRep0LongDecoders = [];\n  this._posSlotDecoder = [];\n  this._posDecoders = [];\n  this._posAlignDecoder = new LZMA.BitTreeDecoder(4);\n  this._lenDecoder = new LZMA.LenDecoder();\n  this._repLenDecoder = new LZMA.LenDecoder();\n  this._literalDecoder = new LZMA.LiteralDecoder();\n  this._dictionarySize = -1;\n  this._dictionarySizeCheck = -1;\n\n  this._posSlotDecoder[0] = new LZMA.BitTreeDecoder(6);\n  this._posSlotDecoder[1] = new LZMA.BitTreeDecoder(6);\n  this._posSlotDecoder[2] = new LZMA.BitTreeDecoder(6);\n  this._posSlotDecoder[3] = new LZMA.BitTreeDecoder(6);\n};\n\nLZMA.Decoder.prototype.setDictionarySize = function (dictionarySize) {\n  if (dictionarySize < 0) {\n    return false;\n  }\n  if (this._dictionarySize !== dictionarySize) {\n    this._dictionarySize = dictionarySize;\n    this._dictionarySizeCheck = Math.max(this._dictionarySize, 1);\n    this._outWindow.create(Math.max(this._dictionarySizeCheck, 4096));\n  }\n  return true;\n};\n\nLZMA.Decoder.prototype.setLcLpPb = function (lc, lp, pb) {\n  var numPosStates = 1 << pb;\n\n  if (lc > 8 || lp > 4 || pb > 4) {\n    return false;\n  }\n\n  this._literalDecoder.create(lp, lc);\n\n  this._lenDecoder.create(numPosStates);\n  this._repLenDecoder.create(numPosStates);\n  this._posStateMask = numPosStates - 1;\n\n  return true;\n};\n\nLZMA.Decoder.prototype.init = function () {\n  var i = 4;\n\n  this._outWindow.init(false);\n\n  LZMA.initBitModels(this._isMatchDecoders, 192);\n  LZMA.initBitModels(this._isRep0LongDecoders, 192);\n  LZMA.initBitModels(this._isRepDecoders, 12);\n  LZMA.initBitModels(this._isRepG0Decoders, 12);\n  LZMA.initBitModels(this._isRepG1Decoders, 12);\n  LZMA.initBitModels(this._isRepG2Decoders, 12);\n  LZMA.initBitModels(this._posDecoders, 114);\n\n  this._literalDecoder.init();\n\n  while (i--) {\n    this._posSlotDecoder[i].init();\n  }\n\n  this._lenDecoder.init();\n  this._repLenDecoder.init();\n  this._posAlignDecoder.init();\n  this._rangeDecoder.init();\n};\n\nLZMA.Decoder.prototype.decode = function (inStream, outStream, outSize) {\n  var state = 0,\n      rep0 = 0,\n      rep1 = 0,\n      rep2 = 0,\n      rep3 = 0,\n      nowPos64 = 0,\n      prevByte = 0,\n      posState,\n      decoder2,\n      len,\n      distance,\n      posSlot,\n      numDirectBits;\n\n  this._rangeDecoder.setStream(inStream);\n  this._outWindow.setStream(outStream);\n\n  this.init();\n\n  while (outSize < 0 || nowPos64 < outSize) {\n    posState = nowPos64 & this._posStateMask;\n\n    if (this._rangeDecoder.decodeBit(this._isMatchDecoders, (state << 4) + posState) === 0) {\n      decoder2 = this._literalDecoder.getDecoder(nowPos64++, prevByte);\n\n      if (state >= 7) {\n        prevByte = decoder2.decodeWithMatchByte(this._rangeDecoder, this._outWindow.getByte(rep0));\n      } else {\n        prevByte = decoder2.decodeNormal(this._rangeDecoder);\n      }\n      this._outWindow.putByte(prevByte);\n\n      state = state < 4 ? 0 : state - (state < 10 ? 3 : 6);\n    } else {\n      if (this._rangeDecoder.decodeBit(this._isRepDecoders, state) === 1) {\n        len = 0;\n        if (this._rangeDecoder.decodeBit(this._isRepG0Decoders, state) === 0) {\n          if (this._rangeDecoder.decodeBit(this._isRep0LongDecoders, (state << 4) + posState) === 0) {\n            state = state < 7 ? 9 : 11;\n            len = 1;\n          }\n        } else {\n          if (this._rangeDecoder.decodeBit(this._isRepG1Decoders, state) === 0) {\n            distance = rep1;\n          } else {\n            if (this._rangeDecoder.decodeBit(this._isRepG2Decoders, state) === 0) {\n              distance = rep2;\n            } else {\n              distance = rep3;\n              rep3 = rep2;\n            }\n            rep2 = rep1;\n          }\n          rep1 = rep0;\n          rep0 = distance;\n        }\n        if (len === 0) {\n          len = 2 + this._repLenDecoder.decode(this._rangeDecoder, posState);\n          state = state < 7 ? 8 : 11;\n        }\n      } else {\n        rep3 = rep2;\n        rep2 = rep1;\n        rep1 = rep0;\n\n        len = 2 + this._lenDecoder.decode(this._rangeDecoder, posState);\n        state = state < 7 ? 7 : 10;\n\n        posSlot = this._posSlotDecoder[len <= 5 ? len - 2 : 3].decode(this._rangeDecoder);\n        if (posSlot >= 4) {\n          numDirectBits = (posSlot >> 1) - 1;\n          rep0 = (2 | posSlot & 1) << numDirectBits;\n\n          if (posSlot < 14) {\n            rep0 += LZMA.reverseDecode2(this._posDecoders, rep0 - posSlot - 1, this._rangeDecoder, numDirectBits);\n          } else {\n            rep0 += this._rangeDecoder.decodeDirectBits(numDirectBits - 4) << 4;\n            rep0 += this._posAlignDecoder.reverseDecode(this._rangeDecoder);\n            if (rep0 < 0) {\n              if (rep0 === -1) {\n                break;\n              }\n              return false;\n            }\n          }\n        } else {\n          rep0 = posSlot;\n        }\n      }\n\n      if (rep0 >= nowPos64 || rep0 >= this._dictionarySizeCheck) {\n        return false;\n      }\n\n      this._outWindow.copyBlock(rep0, len);\n      nowPos64 += len;\n      prevByte = this._outWindow.getByte(0);\n    }\n  }\n\n  this._outWindow.flush();\n  this._outWindow.releaseStream();\n  this._rangeDecoder.releaseStream();\n\n  return true;\n};\n\nLZMA.Decoder.prototype.setDecoderProperties = function (properties) {\n  var value, lc, lp, pb, dictionarySize;\n\n  if (properties.size < 5) {\n    return false;\n  }\n\n  value = properties.readByte();\n  lc = value % 9;\n  value = ~ ~(value / 9);\n  lp = value % 5;\n  pb = ~ ~(value / 5);\n\n  if (!this.setLcLpPb(lc, lp, pb)) {\n    return false;\n  }\n\n  dictionarySize = properties.readByte();\n  dictionarySize |= properties.readByte() << 8;\n  dictionarySize |= properties.readByte() << 16;\n  dictionarySize += properties.readByte() * 16777216;\n\n  return this.setDictionarySize(dictionarySize);\n};\n\nLZMA.decompress = function (properties, inStream, outStream, outSize) {\n  var decoder = new LZMA.Decoder();\n\n  if (!decoder.setDecoderProperties(properties)) {\n    throw \'Incorrect stream properties\';\n  }\n\n  if (!decoder.decode(inStream, outStream, outSize)) {\n    throw \'Error in data stream\';\n  }\n\n  return true;\n};\n\nexports.default = LZMA;\n\n},{}],3:[function(require,module,exports){\n\'use strict\';\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.unIndexGeometryData = unIndexGeometryData;\nexports.createModelBuffers = createModelBuffers;\n/*\n  un-indexes raw geometry data hash with indices\n  @geomData: hash containing arraybuffers, by attributes : ie\n  {\n      position: [....],\n      normal: [....],\n      indices: [...]\n  }\n*/\nfunction unIndexGeometryData(geomData) {\n  if (!(\'indices\' in geomData)) {\n    return geomData;\n  }\n  var bufferTypes = [\'positions\', \'normals\', \'colors\', \'uvs\'];\n  var bufferTypeSizes = { positions: 3, normals: 3, colors: 4, uvs: 3 };\n  var output = {};\n  geomData.indices.forEach(function (inputIndex, outIndex) {\n    bufferTypes.forEach(function (bufferType) {\n      if (geomData[bufferType] && geomData[bufferType].length > 0) {\n        var size = bufferTypeSizes[bufferType];\n\n        if (!output[bufferType]) {\n          output[bufferType] = new Float32Array(geomData.indices.length * size);\n        }\n\n        for (var i = 0; i < size; i++) {\n          output[bufferType][outIndex * size + i] = geomData[bufferType][inputIndex * size + i];\n        }\n        // output[bufferType][outIndex * size] = geomData[bufferType][inputIndex * size]\n        // output[bufferType][outIndex * size + 1] = geomData[bufferType][inputIndex * size + 1]\n        // output[bufferType][outIndex * size + 2] = geomData[bufferType][inputIndex * size + 2]\n      }\n    });\n  });\n  return output;\n}\n\nfunction createModelBuffers(file) {\n  console.log(\'creating model buffers\');\n\n  var indices = file.body.indices;\n  var positions = file.body.vertices;\n  var normals = file.body.normals;\n  var uvs = [];\n  var colors = [];\n\n  // materials = []\n\n  var uvMaps = file.body.uvMaps;\n  if (uvMaps !== undefined && uvMaps.length > 0) {\n    uvs = uvMaps[0].uv;\n  }\n\n  var attrMaps = file.body.attrMaps;\n  if (attrMaps !== undefined && attrMaps.length > 0 && attrMaps[0].name === \'Color\') {\n    colors = attrMaps[0].attr;\n  }\n\n  /*\n    geometry.computeOffsets()\n   // compute vertex normals if not present in the CTM model\n  if ( geometry.attributes.normal === undefined ) {\n    geometry.computeVertexNormals()\n  }*/\n\n  return { positions: positions, indices: indices, normals: normals, uvs: uvs, colors: colors };\n}\n\n},{}],4:[function(require,module,exports){\n\'use strict\';\n\nvar _ctm = require(\'./ctm\');\n\nvar _ctm2 = _interopRequireDefault(_ctm);\n\nvar _parseHelpers = require(\'./parseHelpers\');\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nself.onmessage = function (event) {\n  var files = [];\n\n  for (var i = 0; i < event.data.offsets.length; i++) {\n    var stream = new _ctm2.default.Stream(event.data.data);\n    stream.offset = event.data.offsets[i];\n\n    var geometry = (0, _parseHelpers.unIndexGeometryData)((0, _parseHelpers.createModelBuffers)(new _ctm2.default.File(stream)));\n    files[i] = geometry;\n  }\n\n  self.postMessage(files);\n  self.close();\n};\n\n},{"./ctm":1,"./parseHelpers":3}]},{},[4])'], { type: "text/javascript" }))); // browserify

      worker.onmessage = function (event) {
        var files = event.data;

        obs.onNext({ progress: 1, total: Math.NaN }); // FIXME : this is absurd, and should not be done BEFORE the actual end of data
        //but we need to fix asset managment first
        files.forEach(function (geometry) {
          //let geometry = createModelBuffers(ctmFile)
          // obs.onNext({progress: 1, total:Math.NaN})
          obs.onNext(geometry);
        });

        obs.onCompleted();
      };
      worker.onerror = function (event) {
        obs.onError('filename:' + event.filename + ' lineno: ' + event.lineno + ' error: ' + event.message);
      };

      worker.postMessage({ 'data': binaryData, 'offsets': offsets });
      obs.catch(function (e) {
        return worker.terminate();
      });
    })();
  } else {
    for (var i = 0; i < offsets.length; i++) {
      try {
        var stream = new _ctm2.default.Stream(binaryData);

        stream.offset = offsets[i];
        var ctmFile = new _ctm2.default.File(stream);

        var geometry = (0, _parseHelpers.createModelBuffers)(ctmFile);
        // obs.onNext({progress: 1, total:Math.NaN})
        obs.onNext(geometry);
      } catch (error) {
        obs.onError(error);
      }
    }

    // obs.onNext({progress: 1, total:Math.NaN})
    // obs.onCompleted()
  }
  return obs;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ctm":4,"./parseHelpers":7,"./utils":8,"composite-detect":2,"fast.js/object/assign":3}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var LZMA = LZMA || {};

LZMA.OutWindow = function () {
  this._windowSize = 0;
};

LZMA.OutWindow.prototype.create = function (windowSize) {
  if (!this._buffer || this._windowSize !== windowSize) {
    this._buffer = [];
  }
  this._windowSize = windowSize;
  this._pos = 0;
  this._streamPos = 0;
};

LZMA.OutWindow.prototype.flush = function () {
  var size = this._pos - this._streamPos;
  if (size !== 0) {
    while (size--) {
      this._stream.writeByte(this._buffer[this._streamPos++]);
    }
    if (this._pos >= this._windowSize) {
      this._pos = 0;
    }
    this._streamPos = this._pos;
  }
};

LZMA.OutWindow.prototype.releaseStream = function () {
  this.flush();
  this._stream = null;
};

LZMA.OutWindow.prototype.setStream = function (stream) {
  this.releaseStream();
  this._stream = stream;
};

LZMA.OutWindow.prototype.init = function (solid) {
  if (!solid) {
    this._streamPos = 0;
    this._pos = 0;
  }
};

LZMA.OutWindow.prototype.copyBlock = function (distance, len) {
  var pos = this._pos - distance - 1;
  if (pos < 0) {
    pos += this._windowSize;
  }
  while (len--) {
    if (pos >= this._windowSize) {
      pos = 0;
    }
    this._buffer[this._pos++] = this._buffer[pos++];
    if (this._pos >= this._windowSize) {
      this.flush();
    }
  }
};

LZMA.OutWindow.prototype.putByte = function (b) {
  this._buffer[this._pos++] = b;
  if (this._pos >= this._windowSize) {
    this.flush();
  }
};

LZMA.OutWindow.prototype.getByte = function (distance) {
  var pos = this._pos - distance - 1;
  if (pos < 0) {
    pos += this._windowSize;
  }
  return this._buffer[pos];
};

LZMA.RangeDecoder = function () {};

LZMA.RangeDecoder.prototype.setStream = function (stream) {
  this._stream = stream;
};

LZMA.RangeDecoder.prototype.releaseStream = function () {
  this._stream = null;
};

LZMA.RangeDecoder.prototype.init = function () {
  var i = 5;

  this._code = 0;
  this._range = -1;

  while (i--) {
    this._code = this._code << 8 | this._stream.readByte();
  }
};

LZMA.RangeDecoder.prototype.decodeDirectBits = function (numTotalBits) {
  var result = 0,
      i = numTotalBits,
      t;

  while (i--) {
    this._range >>>= 1;
    t = this._code - this._range >>> 31;
    this._code -= this._range & t - 1;
    result = result << 1 | 1 - t;

    if ((this._range & 0xff000000) === 0) {
      this._code = this._code << 8 | this._stream.readByte();
      this._range <<= 8;
    }
  }

  return result;
};

LZMA.RangeDecoder.prototype.decodeBit = function (probs, index) {
  var prob = probs[index],
      newBound = (this._range >>> 11) * prob;

  if ((this._code ^ 0x80000000) < (newBound ^ 0x80000000)) {
    this._range = newBound;
    probs[index] += 2048 - prob >>> 5;
    if ((this._range & 0xff000000) === 0) {
      this._code = this._code << 8 | this._stream.readByte();
      this._range <<= 8;
    }
    return 0;
  }

  this._range -= newBound;
  this._code -= newBound;
  probs[index] -= prob >>> 5;
  if ((this._range & 0xff000000) === 0) {
    this._code = this._code << 8 | this._stream.readByte();
    this._range <<= 8;
  }
  return 1;
};

LZMA.initBitModels = function (probs, len) {
  while (len--) {
    probs[len] = 1024;
  }
};

LZMA.BitTreeDecoder = function (numBitLevels) {
  this._models = [];
  this._numBitLevels = numBitLevels;
};

LZMA.BitTreeDecoder.prototype.init = function () {
  LZMA.initBitModels(this._models, 1 << this._numBitLevels);
};

LZMA.BitTreeDecoder.prototype.decode = function (rangeDecoder) {
  var m = 1,
      i = this._numBitLevels;

  while (i--) {
    m = m << 1 | rangeDecoder.decodeBit(this._models, m);
  }
  return m - (1 << this._numBitLevels);
};

LZMA.BitTreeDecoder.prototype.reverseDecode = function (rangeDecoder) {
  var m = 1,
      symbol = 0,
      i = 0,
      bit;

  for (; i < this._numBitLevels; ++i) {
    bit = rangeDecoder.decodeBit(this._models, m);
    m = m << 1 | bit;
    symbol |= bit << i;
  }
  return symbol;
};

LZMA.reverseDecode2 = function (models, startIndex, rangeDecoder, numBitLevels) {
  var m = 1,
      symbol = 0,
      i = 0,
      bit;

  for (; i < numBitLevels; ++i) {
    bit = rangeDecoder.decodeBit(models, startIndex + m);
    m = m << 1 | bit;
    symbol |= bit << i;
  }
  return symbol;
};

LZMA.LenDecoder = function () {
  this._choice = [];
  this._lowCoder = [];
  this._midCoder = [];
  this._highCoder = new LZMA.BitTreeDecoder(8);
  this._numPosStates = 0;
};

LZMA.LenDecoder.prototype.create = function (numPosStates) {
  for (; this._numPosStates < numPosStates; ++this._numPosStates) {
    this._lowCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);
    this._midCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);
  }
};

LZMA.LenDecoder.prototype.init = function () {
  var i = this._numPosStates;
  LZMA.initBitModels(this._choice, 2);
  while (i--) {
    this._lowCoder[i].init();
    this._midCoder[i].init();
  }
  this._highCoder.init();
};

LZMA.LenDecoder.prototype.decode = function (rangeDecoder, posState) {
  if (rangeDecoder.decodeBit(this._choice, 0) === 0) {
    return this._lowCoder[posState].decode(rangeDecoder);
  }
  if (rangeDecoder.decodeBit(this._choice, 1) === 0) {
    return 8 + this._midCoder[posState].decode(rangeDecoder);
  }
  return 16 + this._highCoder.decode(rangeDecoder);
};

LZMA.Decoder2 = function () {
  this._decoders = [];
};

LZMA.Decoder2.prototype.init = function () {
  LZMA.initBitModels(this._decoders, 0x300);
};

LZMA.Decoder2.prototype.decodeNormal = function (rangeDecoder) {
  var symbol = 1;

  do {
    symbol = symbol << 1 | rangeDecoder.decodeBit(this._decoders, symbol);
  } while (symbol < 0x100);

  return symbol & 0xff;
};

LZMA.Decoder2.prototype.decodeWithMatchByte = function (rangeDecoder, matchByte) {
  var symbol = 1,
      matchBit,
      bit;

  do {
    matchBit = matchByte >> 7 & 1;
    matchByte <<= 1;
    bit = rangeDecoder.decodeBit(this._decoders, (1 + matchBit << 8) + symbol);
    symbol = symbol << 1 | bit;
    if (matchBit !== bit) {
      while (symbol < 0x100) {
        symbol = symbol << 1 | rangeDecoder.decodeBit(this._decoders, symbol);
      }
      break;
    }
  } while (symbol < 0x100);

  return symbol & 0xff;
};

LZMA.LiteralDecoder = function () {};

LZMA.LiteralDecoder.prototype.create = function (numPosBits, numPrevBits) {
  var i;

  if (this._coders && this._numPrevBits === numPrevBits && this._numPosBits === numPosBits) {
    return;
  }
  this._numPosBits = numPosBits;
  this._posMask = (1 << numPosBits) - 1;
  this._numPrevBits = numPrevBits;

  this._coders = [];

  i = 1 << this._numPrevBits + this._numPosBits;
  while (i--) {
    this._coders[i] = new LZMA.Decoder2();
  }
};

LZMA.LiteralDecoder.prototype.init = function () {
  var i = 1 << this._numPrevBits + this._numPosBits;
  while (i--) {
    this._coders[i].init();
  }
};

LZMA.LiteralDecoder.prototype.getDecoder = function (pos, prevByte) {
  return this._coders[((pos & this._posMask) << this._numPrevBits) + ((prevByte & 0xff) >>> 8 - this._numPrevBits)];
};

LZMA.Decoder = function () {
  this._outWindow = new LZMA.OutWindow();
  this._rangeDecoder = new LZMA.RangeDecoder();
  this._isMatchDecoders = [];
  this._isRepDecoders = [];
  this._isRepG0Decoders = [];
  this._isRepG1Decoders = [];
  this._isRepG2Decoders = [];
  this._isRep0LongDecoders = [];
  this._posSlotDecoder = [];
  this._posDecoders = [];
  this._posAlignDecoder = new LZMA.BitTreeDecoder(4);
  this._lenDecoder = new LZMA.LenDecoder();
  this._repLenDecoder = new LZMA.LenDecoder();
  this._literalDecoder = new LZMA.LiteralDecoder();
  this._dictionarySize = -1;
  this._dictionarySizeCheck = -1;

  this._posSlotDecoder[0] = new LZMA.BitTreeDecoder(6);
  this._posSlotDecoder[1] = new LZMA.BitTreeDecoder(6);
  this._posSlotDecoder[2] = new LZMA.BitTreeDecoder(6);
  this._posSlotDecoder[3] = new LZMA.BitTreeDecoder(6);
};

LZMA.Decoder.prototype.setDictionarySize = function (dictionarySize) {
  if (dictionarySize < 0) {
    return false;
  }
  if (this._dictionarySize !== dictionarySize) {
    this._dictionarySize = dictionarySize;
    this._dictionarySizeCheck = Math.max(this._dictionarySize, 1);
    this._outWindow.create(Math.max(this._dictionarySizeCheck, 4096));
  }
  return true;
};

LZMA.Decoder.prototype.setLcLpPb = function (lc, lp, pb) {
  var numPosStates = 1 << pb;

  if (lc > 8 || lp > 4 || pb > 4) {
    return false;
  }

  this._literalDecoder.create(lp, lc);

  this._lenDecoder.create(numPosStates);
  this._repLenDecoder.create(numPosStates);
  this._posStateMask = numPosStates - 1;

  return true;
};

LZMA.Decoder.prototype.init = function () {
  var i = 4;

  this._outWindow.init(false);

  LZMA.initBitModels(this._isMatchDecoders, 192);
  LZMA.initBitModels(this._isRep0LongDecoders, 192);
  LZMA.initBitModels(this._isRepDecoders, 12);
  LZMA.initBitModels(this._isRepG0Decoders, 12);
  LZMA.initBitModels(this._isRepG1Decoders, 12);
  LZMA.initBitModels(this._isRepG2Decoders, 12);
  LZMA.initBitModels(this._posDecoders, 114);

  this._literalDecoder.init();

  while (i--) {
    this._posSlotDecoder[i].init();
  }

  this._lenDecoder.init();
  this._repLenDecoder.init();
  this._posAlignDecoder.init();
  this._rangeDecoder.init();
};

LZMA.Decoder.prototype.decode = function (inStream, outStream, outSize) {
  var state = 0,
      rep0 = 0,
      rep1 = 0,
      rep2 = 0,
      rep3 = 0,
      nowPos64 = 0,
      prevByte = 0,
      posState,
      decoder2,
      len,
      distance,
      posSlot,
      numDirectBits;

  this._rangeDecoder.setStream(inStream);
  this._outWindow.setStream(outStream);

  this.init();

  while (outSize < 0 || nowPos64 < outSize) {
    posState = nowPos64 & this._posStateMask;

    if (this._rangeDecoder.decodeBit(this._isMatchDecoders, (state << 4) + posState) === 0) {
      decoder2 = this._literalDecoder.getDecoder(nowPos64++, prevByte);

      if (state >= 7) {
        prevByte = decoder2.decodeWithMatchByte(this._rangeDecoder, this._outWindow.getByte(rep0));
      } else {
        prevByte = decoder2.decodeNormal(this._rangeDecoder);
      }
      this._outWindow.putByte(prevByte);

      state = state < 4 ? 0 : state - (state < 10 ? 3 : 6);
    } else {
      if (this._rangeDecoder.decodeBit(this._isRepDecoders, state) === 1) {
        len = 0;
        if (this._rangeDecoder.decodeBit(this._isRepG0Decoders, state) === 0) {
          if (this._rangeDecoder.decodeBit(this._isRep0LongDecoders, (state << 4) + posState) === 0) {
            state = state < 7 ? 9 : 11;
            len = 1;
          }
        } else {
          if (this._rangeDecoder.decodeBit(this._isRepG1Decoders, state) === 0) {
            distance = rep1;
          } else {
            if (this._rangeDecoder.decodeBit(this._isRepG2Decoders, state) === 0) {
              distance = rep2;
            } else {
              distance = rep3;
              rep3 = rep2;
            }
            rep2 = rep1;
          }
          rep1 = rep0;
          rep0 = distance;
        }
        if (len === 0) {
          len = 2 + this._repLenDecoder.decode(this._rangeDecoder, posState);
          state = state < 7 ? 8 : 11;
        }
      } else {
        rep3 = rep2;
        rep2 = rep1;
        rep1 = rep0;

        len = 2 + this._lenDecoder.decode(this._rangeDecoder, posState);
        state = state < 7 ? 7 : 10;

        posSlot = this._posSlotDecoder[len <= 5 ? len - 2 : 3].decode(this._rangeDecoder);
        if (posSlot >= 4) {
          numDirectBits = (posSlot >> 1) - 1;
          rep0 = (2 | posSlot & 1) << numDirectBits;

          if (posSlot < 14) {
            rep0 += LZMA.reverseDecode2(this._posDecoders, rep0 - posSlot - 1, this._rangeDecoder, numDirectBits);
          } else {
            rep0 += this._rangeDecoder.decodeDirectBits(numDirectBits - 4) << 4;
            rep0 += this._posAlignDecoder.reverseDecode(this._rangeDecoder);
            if (rep0 < 0) {
              if (rep0 === -1) {
                break;
              }
              return false;
            }
          }
        } else {
          rep0 = posSlot;
        }
      }

      if (rep0 >= nowPos64 || rep0 >= this._dictionarySizeCheck) {
        return false;
      }

      this._outWindow.copyBlock(rep0, len);
      nowPos64 += len;
      prevByte = this._outWindow.getByte(0);
    }
  }

  this._outWindow.flush();
  this._outWindow.releaseStream();
  this._rangeDecoder.releaseStream();

  return true;
};

LZMA.Decoder.prototype.setDecoderProperties = function (properties) {
  var value, lc, lp, pb, dictionarySize;

  if (properties.size < 5) {
    return false;
  }

  value = properties.readByte();
  lc = value % 9;
  value = ~ ~(value / 9);
  lp = value % 5;
  pb = ~ ~(value / 5);

  if (!this.setLcLpPb(lc, lp, pb)) {
    return false;
  }

  dictionarySize = properties.readByte();
  dictionarySize |= properties.readByte() << 8;
  dictionarySize |= properties.readByte() << 16;
  dictionarySize += properties.readByte() * 16777216;

  return this.setDictionarySize(dictionarySize);
};

LZMA.decompress = function (properties, inStream, outStream, outSize) {
  var decoder = new LZMA.Decoder();

  if (!decoder.setDecoderProperties(properties)) {
    throw 'Incorrect stream properties';
  }

  if (!decoder.decode(inStream, outStream, outSize)) {
    throw 'Error in data stream';
  }

  return true;
};

exports.default = LZMA;

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toArrayBuffer = toArrayBuffer;
exports.str2ab = str2ab;
exports.str2ab2 = str2ab2;
exports.ensureArrayBuffer = ensureArrayBuffer;
function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function str2ab2(str) {
  var idx,
      len = str.length,
      arr = new Array(len);
  for (idx = 0; idx < len; ++idx) {
    arr[idx] = str.charCodeAt(idx) & 0xFF;
  }
  // You may create an ArrayBuffer from a standard array (of values) as follows:
  return new Uint8Array(arr).buffer;
}

function ensureArrayBuffer(data) {
  if (typeof data == 'string' || data instanceof String) {
    return str2ab2(data);
  } else {
    return data;
  }
}

},{}]},{},[5])(5)
});