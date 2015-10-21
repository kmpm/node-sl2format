const debug = require('debug')('sl2:header');

var Header = module.exports = function () {
  debug('new Header');
  this.format = 'sl2';
  this.version = 0;
  this.data = null;
};

Header.read = function (bufr) {
  var header = new Header();
  debug('reading format');
  var v = bufr.UInt16();
  switch (v) {
    case 1: header.format = 'slg';
      break;
    case 2: header.format = 'sl2';
      break;
    default:
      throw new Error('Unknown formatVersion:' + v.toString());
  }
  if (v === 2) {
    header.version = bufr.asShort();
    header.data = bufr.slice(6).data;
  }
  else {
    header.data = bufr.slice(8);
  }
  return header;
};

