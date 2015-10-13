const debug = require('debug')('sl2:bufferreader');


var BufferReader = module.exports = function (buf) {
	//debug('new BufferReader with %d length buffer', buf.length);
	if (!(buf instanceof Buffer)) {
		buf = new Buffer(buf);
	}
	this.index = 0;
	this.data = buf;
	this.length = buf.length;
}

BufferReader.prototype.toBuffer = function () {
	return this.slice().data;
}

BufferReader.prototype.tell = function () {
	return this.index;
};

BufferReader.prototype.seek = function (pos) {
	if (pos > this.length) {
		throw new Error('Seek beyond EOF');
	}
	this.index = pos;
	debug('new index:%s', this.index);
}

BufferReader.prototype.leftInBuffer = function () {
	return this.length - this.index;
}

BufferReader.prototype.eof = function () {
	return this.index >= this.length;
}


BufferReader.prototype.asShort = function () {
	// var b = new Buffer([this.UInt8(), this.UInt8()].reverse());
	// return b.readUInt16LE(0);
	return this.UInt16();
}

BufferReader.prototype.asInt = function () {
	var v = this.data.readUInt32LE(this.index);
	this.index += 4;
	return v;
}

BufferReader.prototype.asFloat = function () {
	return this.float();
}

BufferReader.prototype.UInt8 = function () {
	//debug('UInt8:%d', this.index);
	return this.data.readUInt8(this.index++);
};

BufferReader.prototype.UInt16 = function () {
	//debug('UInt16:%d', this.index);
	var v = this.data.readUInt16LE(this.index);
	this.index += 2;
	return v;
};

BufferReader.prototype.UInt32 = function () {
	//debug('UInt32:%d', this.index);
	var v = this.data.readUInt32LE(this.index);
	this.index += 4;
	return v;
};

BufferReader.prototype.float = function () {
	var v = this.data.readFloatLE(this.index);
	if (isNaN(v)) {
		debug('float is not a number', this.data.slice(this.index, this.index + 4));
	}
	this.index += 4;
	return v;
};

BufferReader.prototype.word = function () {
	//debug('word:%d', this.index);
	var v = this.UInt16() + 65536 * this.UInt16();
	return v;
}

BufferReader.prototype.slice = function (length) {
	if (typeof length === 'undefined') {
		length = this.data.length - this.index;
		debug('length: %d, index:%d, length:%d', this.data.length, this.index, length);
	}
	var end = this.index + length;
	//debug('slicing from %s to %s', this.index, end);
	var reader = new BufferReader(this.data.slice(this.index, end));
	this.index += length;
	return reader;
};

BufferReader.prototype.sliceShort = function (offset) {
	var size = this.data.readUInt16LE(this.index + offset);
	debug('sliceShort size: %d as offset %d', size, offset);
	return this.slice(size);
}
