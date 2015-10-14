const debug = require('debug')('sl2:reader');
const util = require('util');
const Transform = require('stream').Transform;
const BufferReader = require('./bufferreader');
const Header = require('./header');
const blocks = require('./blocks');



util.inherits(Reader, Transform);

const STATE = {
  Header: 0,
  Body: 1
};



function Reader(options) {
  if (!(this instanceof Reader)) {
    return new Reader(options);
  }
  options = options || {};
  this.options = {
    feetToMeter: typeof options.feetToMeter === 'undefined' ? false : options.feetToMeter,
    radToDeg: typeof options.radToDeg === 'undefined' ? false : options.radToDeg,
    speedInUnit: typeof options.speedInUnit === 'string' && blocks.SPEED_UNITS.indexOf(options.speedInUnit) >= 0 ?
      options.speedInUnit : 'kn',
    convertProjection: typeof options.convertProjection === 'undefined' ? false : options.convertProjection
  };
  Transform.call(this, {
    objectMode: true
  });
  this.header = null;
  this._state = STATE.Header;
  this._buf = null;
  this._pushed = 0;
  this._blocks = 0;
  this._chunk = 0;
}


Reader.prototype._transform = function (chunk, enc, done) {
  if (this._state === STATE.Header) {
    var br = new BufferReader(chunk);
    this.header = Header.read(br);
    chunk = br.toBuffer();
    this._state = STATE.Body;
    this.emit('header', this.header);
  }
  if (this._state === STATE.Body) {
    this.readBlocks(chunk);
  }
  debug('chunk %d done', this._chunk++);
  done();
};


Reader.prototype.readBlocks = function (buf) {
  var flush = false;
  if (typeof buf !== 'undefined') {
    if (this._buf === null) {
      this._buf = buf;
    }
    else {
      this._buf = Buffer.concat([this._buf, buf]);
    }
  }
  else {
    flush = true;
  }
  if (!(this._buf instanceof Buffer)) {
    throw new Error('bad type of _buf ' + typeof buf + ' ' + typeof this._buf);
  }
  var br = new BufferReader(this._buf);

  while (!br.eof()) {
    var block = blocks.reader(br, flush, this.options);
    if (flush) {
      this._buf = br.toBuffer();
    }
    if (block === null) {
      this._buf = br.toBuffer();
      return;
    }

    this._blocks += 1;

    try {
      //if (typeof block !== 'object') {
      //console.log('blocks: %d, pushed: %d', this._blocks, this._pushed, block);
      //}
      this.push(block);
      this._pushed += 1;
    }
    catch (err) {
      debug('ERROR! blocks: %d, pushed: %d', this._blocks, this._pushed, block);
      throw err;
    }
  }
  debug('empty buffer');
};


Reader.prototype._flush = function (done) {
  debug('flushing with %d in buffer', this._buf.length);
  while (this._buf.length > 1) {
    debug('reading blocks...');
    this.readBlocks();
  }
  debug('flushed %d blocks, %d pushed', this._blocks, this._pushed);
  done();
};

module.exports = Reader;
