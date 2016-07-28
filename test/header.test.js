var Code = require('code');   // assertion library
var expect = Code.expect;
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var Header = require('../lib/header');
var BufferReader = require('../lib/bufferreader');

lab.experiment('header', function () {

  lab.test('format slg', function (done) {
    var buf = new Buffer('01000000800c00000800', 'hex');
    var br = new BufferReader(buf);

    var header = Header.read(br);
    expect(header.format).to.equal('slg');
    done();
  });

  lab.test('format sl2', function (done) {
    var buf = new Buffer('02000000800c00000800', 'hex');
    var br = new BufferReader(buf);

    var header = Header.read(br);
    expect(header.format).to.equal('sl2');
    done();
  });

  lab.test('invalid format', function (done) {
    var buf = new Buffer('03000000800c00000800', 'hex');
    var br = new BufferReader(buf);
    function fn() {
      Header.read(br);
    }
    expect(fn).to.throw(Error, 'Unknown formatVersion:3');
    done();
  });

});
