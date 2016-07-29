var debug = require('debug')('sl2:block');
var Flags = require('./flags');
var EARTH_RADIUS = 6356752.3142;
var RAD_CONVERSION = 180 / Math.PI;
var FEET_CONVERSION = 0.3048;

var KNOTS_MS = 0.514444444;
var KNOTS_KMH = 1.85200;
var KNOTS_MPH = 1.15077945;

var CHANNEL_NAMES = {
  0: 'Primary',
  1: 'Secondary',
  2: 'DSI',
  3: 'Left',
  4: 'Right',
  5: 'Composite'
};

var CHANNEL_INVALID = 'Invalid';

var SPEED_UNITS = [
  'kts',   //knots
  'kmh',  //kilometers per hour
  'mph',  //miles per hour
  'ms'  //meters per second
];

var SPEED_FACTORS = {
  'kts': 1,
  'kmh': KNOTS_KMH,
  'mph': KNOTS_MPH,
  'ms': KNOTS_MS
};



function Block() {
  // this.byteOffset1 = 0;
  // this.byteOffset2 = 0;
  // this.byteOffset3 = 0;
  this.frameIndex = 0;
  this.blockSize = 0;
  this.packetSize = 0;
  this.lastBlockSize = 0;
  this.channel = CHANNEL_INVALID;
  this.time1 = 0;
  this.waterDepth = 0;
  this.temperature = -126;
  this.frequency = 0;
  this.keelDepth = 0;
  this.upperLimit = 0;
  this.lowerLimit = 0;
  this.altitude = 0;
  this.heading = 0;
  this.courseOverGround = 0;
  this.waterSpeed = 0;
  this.gpsSpeed = 0;
  this.longitude = 0;
  this.latitude = 0;
  this.flags = 0;

}



function reader(bufr, flush, options) {
  if (typeof options === 'undefined' && typeof flush === 'object') {
    options = flush;
    flush = false;
  }
  flush = typeof flush === 'undefined' ? false : flush;
  options = options || {};

  if (typeof bufr === 'undefined') {
    throw new Error('Argument error bufr');
  }

  var block = new Block();
  var here = bufr.tell();
  var v = bufr.leftInBuffer();
  debug('reading new block at %d with %d left', here, v);
  if (v < 140) {
    debug('not enough to check size');
    return null;
  }

  block.blockSize = bufr.peekShort(26);
  // try {
  //   block.blockSize = bufr.peekShort(26);
  // }
  // catch (err) {
  //   //TODO: this should really not happen
  //   //console.log('blockSize: %d, leftInBuffer:%d, flush:%s', block.blockSize, v, flush);
  //   throw err;
  // }

  if (block.blockSize > v) {
    debug('blockSize: %d, leftInBuffer:%d, flush:%s', block.blockSize, v, flush);
    if (flush) {
      debug('short ending block');
      block.blockSize = v;
    }
    else {
      return null;
    }
  }

  var br = bufr.slice(block.blockSize);
  if (flush) {
    debug('after slice', br.leftInBuffer());
  }
  if (options.rawBlockHeader) {
    block.meta = {
      data: br.data.slice(0, 144).toString('hex'),
      here: here,
      pingStart: here + 144
    };
  }
  //now actual decoding
  // block.byteOffset1 = br.asIntReverse();
  // block.byteOffset2 = br.asIntReverse();

  //br.asInt(); //unknown;

  //block.byteOffset3 = br.asIntReverse();

  //br.seek(26) blockSize is already taken care of

  br.seek(28);
  block.lastBlockSize = br.asShort();
  v = br.asShort();
  if (CHANNEL_NAMES.hasOwnProperty(v)) {
    block.channel = CHANNEL_NAMES[v];
  }
  else {
    block.channel += ' ' + v.toString();
  }
  block.packetSize = br.asShort();
  debug('blockSize: %d, packetSize: %d, length: %d', block.blockSize, block.packetSize, br.length);
  block.frameIndex = br.asInt();
  block.upperLimit = br.asFloat();
  block.lowerLimit = br.asFloat();

  br.seek(51);
  block.frequency = br.UInt8();

  br.seek(62);
  block.waterDepth = br.asFloat();
  block.keelDepth = br.asFloat();

  br.seek(98);
  block.gpsSpeed = br.asFloat();

  //br.seek(102);
  block.temperature = br.asFloat();
  block.longitude = br.asInt();
  block.latitude = br.asInt();

  //br.seek(114);
  block.waterSpeed = br.asFloat();
  block.courseOverGround = br.asFloat();

  //br.seek(122);
  block.altitude =  br.asFloat();
  block.heading = br.asFloat();

  //br.seek(130); //flags
  block.flags = new Flags(br.asShort());
  //block.flags = br.asFlags().toString(2);

  br.seek(140);
  block.time1 = br.asInt();

  if (options.feetToMeter) {
    debug('converting feet values to meter');
    block.upperLimit = block.upperLimit * FEET_CONVERSION;
    block.lowerLimit = block.lowerLimit * FEET_CONVERSION;
    block.waterDepth = block.waterDepth * FEET_CONVERSION;
    block.keelDepth = block.keelDepth * FEET_CONVERSION;
    block.altitude = block.altitude * FEET_CONVERSION;
  }

  if (options.radToDeg) {
    debug('converting radians to degrees');
    block.courseOverGround = block.courseOverGround * RAD_CONVERSION;
  }

  if (options.convertProjection) {
    debug('fixing lon/lat projection');
    block.longitude = longitude(block.longitude);
    block.latitude = latitude(block.latitude);
  }

  if (options.speedInUnit !== 'kn') {
    var factor = SPEED_FACTORS[options.speedInUnit];
    block.waterSpeed = block.waterSpeed * factor;
    block.gpsSpeed = block.gpsSpeed * factor;
  }

  //block.data = br.data;
  return block;
}

function longitude(intValue) {
  return intValue / EARTH_RADIUS * RAD_CONVERSION;
}

function latitude(intValue) {
  var temp = intValue / EARTH_RADIUS;
  temp = Math.exp(temp);
  temp = (2 * Math.atan(temp)) - (Math.PI / 2);
  return temp * RAD_CONVERSION;
}


exports.Block = Block;
exports.SPEED_UNITS = SPEED_UNITS;
exports.reader = reader;
exports.Flags = Flags;
