var Code = require('code');   // assertion library
var expect = Code.expect;
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var blocks = require('../lib/blocks');
var BufferReader = require('../lib/bufferreader');

var blockdata = require('./blockdata');

lab.experiment('blocks', function () {
  lab.test('reader with no options or flush', function (done) {
    var buf = new Buffer(10);
    var br = new BufferReader(buf);
    blocks.reader(br);
    done();
  });

  lab.test('reader with options, no flush', function (done) {
    var buf = new Buffer(10);
    var br = new BufferReader(buf);
    blocks.reader(br, {});
    done();
  });

  lab.test('reader with no bufferreader', function (done) {
    expect(blocks.reader).to.throw(Error, 'Argument error bufr');
    done();
  });

  lab.test('invalid channel', function (done) {
    var buf = blockdata.block1();
    buf.writeUInt16LE(6, 30); //change to channel nr 6
    var br = new BufferReader(buf);
    var block = blocks.reader(br, true);
    //console.log(block);
    expect(block.channel).to.equal('Invalid 6');
    done();
  });

  lab.test('speed in knots', function (done) {
    var buf = blockdata.block1();
    buf.writeUInt16LE(6, 30); //change to channel nr 6
    var br = new BufferReader(buf);
    var block = blocks.reader(br, true, {speedInUnit: 'kn'});
    //console.log(block);
    expect(block.channel).to.equal('Invalid 6');
    done();
  });

});
