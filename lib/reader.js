var util = require('util');
var Transform = require('stream').Transform;
util.inherits(Reader, Transform);
const debug = require('debug')('sl2:reader');

var BufferReader = require('./bufferreader');
var Header = require('./header');
var Block = require('./block');

const STATE = {
	Header: 0,
	Body: 1
};

function Reader(options) {
	if (!(this instanceof Reader)) {
		return new Reader(options);
	}
	Transform.call(this, {objectMode: true});
	this.header = null;
	this._state = STATE.Header;
	this._buf = null;
	this._pushed = 0;
	this._blocks = 0;
	this._prev;
	this._chunk = 0;
}


Reader.prototype._transform = function (chunk, enc, done) {

	
	if (this._state === STATE.Header) {
		br = new BufferReader(chunk);
		this.header = Header.read(br);
		chunk = br.toBuffer();
		this._state = STATE.Body;
	}
	if (this._state === STATE.Body) {
		this.readBlocks(chunk);
	}
	debug('chunk %d done', this._chunk++);
	done();
}


Reader.prototype.readBlocks = function (buf) {
	if (typeof buf !== 'undefined') {
		if (this._buf === null) {
			this._buf = buf;
		}
		else {
			this._buf = Buffer.concat([this._buf, buf]);
		}
	}
	if (!(this._buf instanceof Buffer)) {
		console.log(this._buf);
		throw new Error('bad type of _buf ' + typeof buf + ' ' + typeof this._buf);
	}
	var br = new BufferReader(this._buf);
	while (!br.eof()) {
		var block = Block.read(br);
		if (block === null) {
			this._buf = br.toBuffer();
			if (br.length < 60000) {
				console.log('null block', br.length, this._prev);
			}
			return;
		}
		this._prev = block;
		this._blocks += 1;
		try {
			//if (typeof block !== 'object') {
			//console.log('blocks: %d, pushed: %d', this._blocks, this._pushed, block);
			//}
			this.push(block);
			this._pushed += 1
		}
		catch (err){
			console.log('blocks: %d, pushed: %d', this._blocks, this._pushed, block);
			throw err;
		}
	}

	debug('br was eof');
}


Reader.prototype._flush = function (done) {
	debug('flushing with %d in buffer', this._buf.length);
	while(!this._buf.length > 1) {
    	this.readBlocks();
  	}
  	debug('flushed %d blocks, %d pushed', this._blocks, this._pushed);
	done();
}

module.exports = Reader;