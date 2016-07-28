var Code = require('code');   // assertion library
var expect = Code.expect;
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var Promise = require('bluebird');
var lib = require('../');
var fs = require('fs');
var path = require('path');
var through2 = require('through2');

var FIELDS = ['frameIndex', 'blockSize', 'packetSize', 'lastBlockSize', 'channel', 'time1'];
var CHANNELS = ['Primary', 'Secondary', 'DSI', 'Left', 'Right', 'Composite'];
var SHORT_MAX = 65535;
var INT_MAX = 18446744073709551615;

var SMALL_BLOCKSIZE = 3216;
var BIGGER_BLOCKSIZE = 2064;

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
      resolve({header: reader.header, options: reader.options, blocks: blocks});
    });
  });
}

function dumpResult(result, filename) {
  fs.writeFileSync(filename, JSON.stringify(result, null, '  '));
}

lab.experiment('reader', function () {


  lab.test('ten first in small.sl2',  function (done) {
    var BLOCKCOUNT = 10;
    var infile = path.join(__dirname, 'fixtures', 'small.sl2');
    var outfile = path.join(__dirname, 'out', 'small-10first.json');

    readFile(infile, outfile, 10 + BLOCKCOUNT * SMALL_BLOCKSIZE)
    .then(function (result) {
      var blocks = result.blocks;
      expect(result.header.format).to.equal('sl2');
      expect(blocks).to.be.an.array();
      expect(blocks.length).to.equal(BLOCKCOUNT);
      var b = blocks[0];
      validBlock(b);
      expect(b).to.equal({
        'frameIndex': 0,
        'blockSize': 3216,
        'packetSize': 3072,
        'lastBlockSize': 0,
        'channel': 'Primary',
        'time1' :3536977920,
        'waterDepth': 6.622000217437744,
        'temperature': 19.350006103515625,
        'frequency': 0,
        'keelDepth': 0,
        'upperLimit': 0,
        'lowerLimit': 19.600000381469727,
        'altitude': 118.89765930175781,
        'heading': 0,
        'courseOverGround': 3.7873644828796387,
        'waterSpeed': 0,
        'gpsSpeed': 2.585312843322754,
        'longitude': 1383678,
        'latitude': 8147302,
        'flags': {
          trackValid: true,
          waterSpeedValid: false,
          positionValid: true,
          waterTempValid: true,
          gpsSpeedValid: true,
          altitudeValid: true,
          headingValid: false
        }
      }, {prototype: false});
      done();
    })
    .catch(done);
  });


  lab.test('forty first in small.sl2 with conversions',  function (done) {
    var BLOCKCOUNT = 40;
    var infile = path.join(__dirname, 'fixtures', 'small.sl2');
    var outfile = path.join(__dirname, 'out', 'small-metric-40first.json');

    readFile(infile, outfile, 10 + BLOCKCOUNT * SMALL_BLOCKSIZE, {
      feetToMeter: true,
      radToDeg: true,
      speedInUnit: 'ms',
      convertProjection: true
    })
    .then(function (result) {
      var blocks = result.blocks;
      expect(blocks.length).to.equal(BLOCKCOUNT);
      var b = blocks[0];
      validBlock(b);
      expect(b).to.equal({
        'frameIndex': 0,
        'blockSize': 3216,
        'packetSize': 3072,
        'lastBlockSize': 0,
        'channel': 'Primary',
        'time1' :3536977920,
        'waterDepth': 2.0183856662750244,
        'temperature': 19.350006103515625,
        'frequency': 0,
        'keelDepth': 0,
        'upperLimit': 0,
        'lowerLimit': 5.974080116271973,
        'altitude': 36.24000655517578,
        'heading': 0,
        'courseOverGround': 217.00000034675082,
        'waterSpeed': 0,
        'gpsSpeed': 1.3299998282492334,
        'longitude': 12.471605890323259,
        'latitude': 58.97372610987078,
        'flags': {
          trackValid: true,
          waterSpeedValid: false,
          positionValid: true,
          waterTempValid: true,
          gpsSpeedValid: true,
          altitudeValid: true,
          headingValid: false
        }
      }, {prototype: false});
      done();
    })
    .catch(done);
  });


  lab.test('small.sl2',  function (done) {
    var BLOCKCOUNT = 4038;
    var infile = path.join(__dirname, 'fixtures', 'small.sl2');
    var outfile = path.join(__dirname, 'out', 'small.json');

    readFile(infile, outfile)
    .then(function (result) {
      var blocks = result.blocks;
      expect(result.header.format).to.equal('sl2');
      expect(blocks.length).to.equal(BLOCKCOUNT);
      done();
    })
    .catch(done);
  });

  lab.test('bigger.sl2', {timeout: 5000}, function (done) {
    //this.timeout = 5000;
    var BLOCKCOUNT = 16885;
    var infile = path.join(__dirname, 'fixtures', 'bigger.sl2');
    var outfile = path.join(__dirname, 'out', 'bigger.json');

    readFile(infile, outfile)
    .then(function (result) {
      var blocks = result.blocks;
      expect(result.header.format).to.equal('sl2');
      expect(blocks.length).to.equal(BLOCKCOUNT);
      done();
    })
    .catch(done);
  });

  lab.test('forty first of bigger.sl2', function (done) {
    var BLOCKCOUNT = 40;
    var infile = path.join(__dirname, 'fixtures', 'bigger.sl2');
    var outfile = path.join(__dirname, 'out', 'bigger-40first.json');

    readFile(infile, outfile,  10 + BLOCKCOUNT * BIGGER_BLOCKSIZE, {
      feetToMeter: true,
      radToDeg: true,
      convertProjection: true,
      rawBlockHeader: true
    })
    .then(function (result) {
      dumpResult(result, path.join(__dirname, 'out', 'bigger-result-40first.json'));
      var blocks = result.blocks;
      expect(result.header.format).to.equal('sl2');
      expect(blocks.length).to.equal(BLOCKCOUNT);
      done();
    })
    .catch(done);
  });


  lab.test('version-1.sl2',  function (done) {
    var BLOCKCOUNT = 14;
    var infile = path.join(__dirname, 'fixtures', 'version-1.sl2');
    var outfile = path.join(__dirname, 'out', 'version-1.json');

    readFile(infile, outfile)
    .then(function (result) {
      var blocks = result.blocks;
      expect(result.header.format).to.equal('sl2');
      expect(blocks.length).to.equal(BLOCKCOUNT);
      done();
    })
    .catch(done);
  });

  lab.test('filter on flags', {timeout: 30000}, function (done) {
    var BLOCKCOUNT = 1819;
    var infile = path.join(__dirname, 'fixtures', 'bigger.sl2');
    var outfile = path.join(__dirname, 'out', 'bigger-filtered.json');

    readFile(infile, outfile, 0, {flags:{positionValid: true}})
    .then(function (result) {
      var blocks = result.blocks;
      expect(result.header.format).to.equal('sl2');
      expect(blocks.length).to.equal(BLOCKCOUNT);
      done();
    })
    .catch(done);

  });

  lab.experiment('private', function () {
    var privateFolder = path.join(__dirname, '..', 'private');

    //skip if 'private' folder is missing
    try {
      if (fs.statSync(privateFolder).isDirectory()) {
        parseInFolder(privateFolder);
      }
    }
    catch (ex) {
      if (!(ex.code && ex.code === 'ENOENT')) {
        throw ex;
      }
    }

    function parseInFolder(inFolder) {
      var files = fs.readdirSync(inFolder).filter(function (f) { return /\.sl2$/.test(f); });
      files.forEach(function (file) {
        lab.test(file, {timeout: 60000}, function (done) {
          var infile = path.join(inFolder, file);
          var b = path.basename(file);
          readFile(infile, path.join(__dirname, 'out', b + '.json'))
          .then(function (result) {
            expect(result).to.include('header', 'blocks');
            expect(result.blocks.length).to.be.above(10); //some arbitary number
            done();
          })
          .catch(done);
        });
      });
    }

  });
});
