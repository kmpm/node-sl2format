var debug = require('debug')('sl2:block');

const EARTH_RADIUS = 6356752.3142;
const RAD_CONVERSION = 180 / Math.PI;
const FEET_CONVERSION = 0.3048;

const KNOTS_MS = 0.514444444;
const KNOTS_KMH = 1.85200;
const KNOTS_MPH = 1.15077945;

const CHANNEL_NAMES = {
  0: 'Primary',
  1: 'Secondary',
  2: 'DSI',
  3: 'Left',
  4: 'Right',
  5: 'Composite'
};

const CHANNEL_INVALID = 'Invalid';

const SPEED_UNITS = [
  'kn',   //knots
  'kmh',  //kilometers per hour
  'mph',  //miles per hour
  'ms'  //meters per second
];

const SPEED_FACTORS = {
  'kn': 1,
  'kmh': KNOTS_KMH,
  'mph': KNOTS_MPH,
  'ms': KNOTS_MS
};

function Block() {

  this.frameIndex = 0;
  this.blockSize = 0;
  this.packetSize = 0;
  this.lastBlockSize = 0;
  this.channel = CHANNEL_INVALID;
  this.time1 = 0;
  this.waterDepth = 0;
  this.temperature = -126;
  this.keelDepth = 0;
  this.altitude = 0;
  this.heading = 0;

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
  var v;
  var block = new Block();

  v = bufr.leftInBuffer();
  if (v < 27) {
    debug('not enough to check size');
    return null;
  }

  var here = bufr.tell();
  bufr.seek(26);
  block.blockSize = bufr.asShort();
  bufr.seek(here); //reset position to begining of block.

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

  br.seek(28);
  block.lastBlockSize = br.asShort();
  v = br.asShort();
  if (CHANNEL_NAMES.hasOwnProperty(v)) {
    block.channel = CHANNEL_NAMES[v];
  }
  else {
    block.channel += v.toString();
  }
  block.packetSize = br.asShort();
  block.frameIndex = br.asInt();
  block.upperLimit = br.asFloat();
  block.lowerLimit = br.asFloat();

  br.seek(51);
  block.frequency = br.UInt8();

  br.seek(62);
  block.waterDepth = br.asFloat();
  block.keelDepth = br.asFloat();

  br.seek(98);
  block.speedGps = br.asFloat();

  //br.seek(102);
  block.temperature = br.asFloat();
  block.longitude = br.asInt();
  block.latitude = br.asInt();

  //br.seek(114);
  block.speedWater = br.asFloat();
  block.courseOverGround = br.asFloat();

  //br.seek(122);
  block.altitude =  br.asFloat();
  block.heading = br.asFloat();

  br.seek(140);
  block.time1 = br.asInt();

  if (options.feetToMeter) {
    block.upperLimit = block.upperLimit * FEET_CONVERSION;
    block.lowerLimit = block.lowerLimit * FEET_CONVERSION;
    block.waterDepth = block.waterDepth * FEET_CONVERSION;
    block.keelDepth = block.keelDepth * FEET_CONVERSION;
    block.altitude = block.altitude * FEET_CONVERSION;
  }

  if (options.radToDeg) {
    block.courseOverGround = block.courseOverGround * RAD_CONVERSION;
  }

  if (options.convertProjection) {
    block.longitude = longitude(block.longitude);
    block.latitude = latitude(block.latitude);
  }

  if (options.speedInUnit !== 'kn') {
    var factor = SPEED_FACTORS[options.speedInUnit];
    block.speedWater = block.speedWater * factor;
    block.speedGps = block.speedGps * factor;
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
