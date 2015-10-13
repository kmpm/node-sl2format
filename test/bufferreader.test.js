var Code = require('code');   // assertion library
var expect = Code.expect;
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var BufferReader = require('../lib/bufferreader');
var fs = require('fs');




lab.experiment('reader', function () {
	lab.test('jox', function (done) {
		var data;
		var first = true;
		var rs = fs.createReadStream(__dirname + '/fixtures/a.sl2', {start: 10, end: 8000});
		rs.on('data', function (chunk) {
			if (first) {
				first = false;
				data = chunk;
			}
			else {
				data = Buffer.concat([data, chunk]);
			}
		})
		rs.on('end', function () {
			console.log('asdf', data);
			var br = new BufferReader(data);
			
			br.seek(26);
			var blockSize = br.asShort();
			var lastBlockSize = br.asShort();
			var sensorID = br.asShort();

			console.log('blockSize', blockSize);
			console.log('lastBlockSize', lastBlockSize);
			console.log('sensorID', sensorID);

			br.seek(62);
			console.log('water depth in feet', br.float());
			console.log('keel depth in feet', br.float());

			br.seek(98);
			console.log('GPS speed in kn', br.float());
			console.log('temperature in C', br.float());

			// for (var i = 0; i < br.length-4; i++) {
			// 	br.seek(i);
			// 	var v = br.asFloat();
			// 	console.log('%d\t%d', i, v);
			// }
			done();
		});
		
	});
});
