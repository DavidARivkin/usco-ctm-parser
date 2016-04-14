'use strict';

var _ctm = require('./ctm');

var _ctm2 = _interopRequireDefault(_ctm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

self.onmessage = function (event) {

	var files = [];

	for (var i = 0; i < event.data.offsets.length; i++) {

		var stream = new _ctm2.default.Stream(event.data.data);
		stream.offset = event.data.offsets[i];

		files[i] = new _ctm2.default.File(stream);
	}

	self.postMessage(files);
	self.close();
};