var Code = require('code');   // assertion library
var expect = Code.expect;
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var BufferReader = require('../lib/bufferreader');


lab.experiment('BufferReader', function () {
  lab.test('seek beyond', function (done) {
    var buf = new Buffer(10);

    var br = new BufferReader(buf);
    function fn() {
      br.seek(20);
    }
    expect(fn).to.throw(Error, 'Seek beyond EOF 20 > 10');
    done();
  });

  lab.test('initialize reader with number', function (done) {
    var br = new BufferReader(10);
    expect(br).to.be.an.instanceof(BufferReader);
    done();
  });
});
