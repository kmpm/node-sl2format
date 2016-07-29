var Code = require('code');   // assertion library
var expect = Code.expect;
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var Flags = require('../lib/flags');

function getNumber(hexString) {
  var buf = new Buffer(hexString, 'hex');
  return buf.readUInt16LE(buf);
}


lab.experiment('flags', function () {


  lab.test('not new with number', function (done) {
    var f = Flags(getNumber('be02'));
    expect(f).to.equal({
      trackValid: true,
      waterSpeedValid: false,
      positionValid: true,
      waterTempValid: true,
      gpsSpeedValid: true,
      altitudeValid: true,
      headingValid: false
    });
    done();
  });

  lab.test('new with number', function (done) {
    var f = new Flags(getNumber('be02'));
    expect(f).to.equal({
      trackValid: true,
      waterSpeedValid: false,
      positionValid: true,
      waterTempValid: true,
      gpsSpeedValid: true,
      altitudeValid: true,
      headingValid: false
    });
    done();
  });

  lab.test('new without number', function (done) {
    var f = new Flags();
    expect(f).to.equal({
      trackValid: false,
      waterSpeedValid: false,
      positionValid: false,
      waterTempValid: false,
      gpsSpeedValid: false,
      altitudeValid: false,
      headingValid: false
    });
    done();
  });
});
