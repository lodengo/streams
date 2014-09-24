var util = require('util');
var stream = require('stream');
if (!stream.Transform) {
	stream = require('readable-stream');
}
var Transform = stream.Transform;
var Readable = stream.Readable;

// ////////////////////////////////////////////////
var JsonStringify = module.exports.JsonStringify = function JsonStringify(
		isArray) {
	Transform.call(this, {
		objectMode : true
	});
	this.isArray = isArray;
	this.idx = 0;
	isArray ? this.push('[') : 0;
};
util.inherits(JsonStringify, Transform);
JsonStringify.prototype._transform = function(obj, encoding, done) {
	this.idx ? this.push(',') : this.idx++;
	this.push(JSON.stringify(obj));
	done();
}
JsonStringify.prototype._flush = function(done) {
	this.isArray ? this.push(']') : 0;
	done();
}
// ///////////////////////////////////////////////////
var ObjectStream = module.exports.ObjectStream = function ObjectStream(data) {
	Readable.call(this, {
		objectMode : true
	})
	this.data = data;
	this.isArray = Array.isArray(data);
	this.idx = 0;
}
util.inherits(ObjectStream, Readable);
ObjectStream.prototype._read = function() {
	var self = this;
	var out = null;
	if (this.isArray && this.idx != this.data.length) {
		out = this.data[this.idx];
	} else if (0 == this.idx) {
		out = this.data;
	}
	this.idx++;

	this.push(out);
}
// //////////////////////////////////////////////////////////
var Transformer = module.exports.Transformer = function Transformer(
		transformFunc) {
	Transform.call(this, {
		objectMode : true
	});
	this.transform = transformFunc;
};
util.inherits(Transformer, Transform);
Transformer.prototype._transform = function(inputObj, encoding, done) {	
	this.transform(inputObj, done);
}
// //////////////////////////////////////////////////////
var Liner = module.exports.Liner = function Liner() {
	Transform.call(this, {
		objectMode : true
	});
	this._lastLineData = null;
};
util.inherits(Liner, Transform);
Liner.prototype._transform = function(chunk, encoding, done) {
	var data = chunk.toString();
	if (this._lastLineData) {
		data = this._lastLineData + data
	}

	var lines = data.split('\n');
	this._lastLineData = lines.splice(lines.length - 1, 1)[0];

	lines.forEach(this.push.bind(this));
	done();
}
Liner.prototype._flush = function(done) {
	if (this._lastLineData) {
		this.push(this._lastLineData);
	}
	this._lastLineData = null;
	done();
}
// //////////////////////////////////////////////////////////
