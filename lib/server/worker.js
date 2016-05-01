'use strict';

var _ctm = require('./ctm');

var _ctm2 = _interopRequireDefault(_ctm);

var _parseHelpers = require('./parseHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

self.onmessage = function (event) {
  var files = [];

  for (var i = 0; i < event.data.offsets.length; i++) {
    var stream = new _ctm2.default.Stream(event.data.data);
    stream.offset = event.data.offsets[i];

    var geometry = (0, _parseHelpers.unIndexGeometryData)((0, _parseHelpers.createModelBuffers)(new _ctm2.default.File(stream)));
    files[i] = geometry;
  }

  self.postMessage(files);
  self.close();
};