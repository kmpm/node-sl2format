var Code = require('code');   // assertion library
var expect = Code.expect;
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var lib = require('../');
var fs = require('fs');
var path = require('path');
var through2 = require('through2');

var FIELDS = ['frameIndex', 'blockSize', 'packetSize', 'lastBlockSize', 'channel', 'time1'];
var CHANNELS = ['Primary', 'Secondary', 'DSI', 'Left', 'Right', 'Composite'];
const SHORT_MAX = 65535;
const INT_MAX = 18446744073709551615;


function validBlock(chunk) {
  expect(chunk, 'missing fields').to.include(FIELDS);
  expect(chunk.frameIndex, 'bad frameIndex').to.be.within(0, INT_MAX);
  expect(chunk.blockSize, 'bad blocksize').to.be.within(144, SHORT_MAX);
  expect(CHANNELS.indexOf(chunk.channel), 'bad channel').to.be.within(0, CHANNELS.length - 1);
}

function readFile(infile, outfile, length, options) {
  return new Promise(function (resolve, reject) {
    var blocks = [];

    var fsoptions = {};
    if (length > 0) {
      fsoptions.start = 0;
      fsoptions.end = length;
    }
    var reader = new lib.Reader(options);
    var ws = fs.createWriteStream(outfile);

    ws.on('error', reject);
    reader.on('error', reject);


    fs.createReadStream(infile, fsoptions)
    .pipe(reader)
    .pipe(through2.obj(function (obj, enc, next) {
      blocks.push(obj);
      this.push(JSON.stringify(obj) + '\n');
      next();
    }))
    .pipe(ws);

    ws.on('finish', function () {
      resolve({blocks: blocks, header: reader.header});
    });
  });

}

lab.experiment('reader', {timeout: 10000}, function () {
  var SMALL_BLOCKSIZE = 3216;

  lab.test('ten first in small.sl2',  function (done) {
    var BLOCKCOUNT = 10;
    var infile = path.join(__dirname, 'fixtures', 'small.sl2');
    var outfile = path.join(__dirname, 'out', 'small-10first.json');

    readFile(infile, outfile, 10 + BLOCKCOUNT * SMALL_BLOCKSIZE)
    .then(function (result) {
      var blocks = result.blocks;
      expect(result.header.formatVersion).to.equal('sl2');
      expect(blocks.length).to.equal(BLOCKCOUNT);
      var b = blocks[0];
      validBlock(b);
      expect(b).to.deep.equal({
        'frameIndex': 0,
        'blockSize': 3216,
        'packetSize': 3072,
        'lastBlockSize': 0,
        'channel': 'Primary',
        'time1' :3536977920,
        'waterDepth': 6.622000217437744,
        'temperature': 19.350006103515625,
        'keelDepth': 0,
        'altitude': 118.89765930175781,
        'heading': 0,
        'upperLimit': 0,
        'lowerLimit': 19.600000381469727,
        'frequency': 0,
        'speedGps': 2.585312843322754,
        'longitude': 1383678,
        'latitude': 8147302,
        'speedWater': 0,
        'courseOverGround': 3.7873644828796387
      }, {prototype: false});
      done();
    })
    .catch(done);
  });

  lab.test('ten first in small.sl2 with conversions',  function (done) {
    var BLOCKCOUNT = 10;
    var infile = path.join(__dirname, 'fixtures', 'small.sl2');
    var outfile = path.join(__dirname, 'out', 'small-metric-10first.json');

    readFile(infile, outfile, 10 + BLOCKCOUNT * SMALL_BLOCKSIZE, {
      feetToMeter: true,
      radToDeg: true,
      speedInUnit: 'ms',
      convertProjection: true
    })
    .then(function (blocks) {
      expect(blocks.length).to.equal(BLOCKCOUNT);
      var b = blocks[0];
      validBlock(b);
      expect(b).to.deep.equal({
        'frameIndex': 0,
        'blockSize': 3216,
        'packetSize': 3072,
        'lastBlockSize': 0,
        'channel': 'Primary',
        'time1' :3536977920,
        'waterDepth': 2.0183856662750244,
        'temperature': 19.350006103515625,
        'keelDepth': 0,
        'altitude': 36.24000655517578,
        'heading': 0,
        'upperLimit': 0,
        'lowerLimit': 5.974080116271973,
        'frequency': 0,
        'speedGps': 1.3299998282492334,
        'longitude': 12.471605890323259,
        'latitude': 58.97372610987078,
        'speedWater': 0,
        'courseOverGround': 217.00000034675082
      }, {prototype: false});
      done();
    })
    .catch(done);
  });
});
