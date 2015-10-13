var debug = require('debug')('sl2:block');

var BufferReader = require('./bufferreader');

const EARTH_RADIUS = 6356752.3142;
const RAD_CONVERSION = 180/Math.PI
const FEET_CONVERSION = 0.3048;

const CHANNEL_NAMES = {
    0: 'Primary',
    1: 'Secondary',
    2: 'DSI',
    3: 'Left',
    4: 'Right',
    5: 'Composite'
};

const CHANNEL_INVALID='Invalid';

var Block = module.exports = function () {
    
    this.blockSize = 0;
    this.lastBlockSize = 0;
    this.frameIndex = 0;
    this.channel = CHANNEL_INVALID;

    this.time1 = 0;
    this.waterDepth = 0;
    this.temperature = -126;
    this.keelDepth = 0;
    this.altitude = 0;
    this.heading = 0;
    this.packetSize = 0;
};


Block.read = function (bufr) {
    if (typeof bufr === 'undefined') {
        throw new Error('Argument error bufr');
    }
    var v;
    var block = new Block();

    v = bufr.leftInBuffer();
    if (v < 27) {
        return null;
    }

    var here = bufr.tell();
    bufr.seek(26)
    block.blockSize = bufr.asShort();
    bufr.seek(here);
    if (block.blockSize > v) {
        return null;
    }

    var br = bufr.slice(block.blockSize);

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
    block.upperLimit = br.asFloat() * FEET_CONVERSION;
    block.lowerLimit = br.asFloat() * FEET_CONVERSION;

    br.seek(51);
    block.frequency = br.UInt8();

    br.seek(62);
    block.waterDepth = br.asFloat() * FEET_CONVERSION;
    block.keelDepth = br.asFloat() * FEET_CONVERSION;

    br.seek(98);
    block.speedGps = br.asFloat();

    br.seek(102);
    block.temperature = br.asFloat();
    block.longitude = longitude(br.asInt());
    block.latitude = latitude(br.asInt());

    br.seek(114);
    block.speedWater = br.asFloat();
    block.courseOverGround = br.asFloat() * RAD_CONVERSION;

    br.seek(122);
    block.altitude =  br.asFloat() * FEET_CONVERSION;
    block.heading = br.asFloat();

    //block.data = br.data;
    return block;
};

function longitude(intValue) {
    return intValue / EARTH_RADIUS * RAD_CONVERSION;
}

function latitude(intValue) {
    var temp = intValue / EARTH_RADIUS;
    temp = Math.exp(temp);
    temp = (2*Math.atan(temp))-(Math.PI/2);
    return temp * RAD_CONVERSION;    
}
