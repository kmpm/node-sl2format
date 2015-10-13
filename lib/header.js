const debug = require('debug')('sl2:header');

var Header = module.exports = function () {
	debug('new Header');
	this.formatVersion = 'sl2';
	this.data = null;
}

Header.read = function (bufr) {

	var header = new Header();
	debug('reading format');
	var v = bufr.UInt16();
	switch(v) {
		case 1: header.formatVersion = 'slg';
			break;
		case 2: header.formatVersion = 'sl2';
			break;
		default:
			throw new Error('Unknown formatVersion:' + v.toString());
	}
	debug('dumping rest of header');
	header.data = bufr.slice(8);
	return header;
}	


