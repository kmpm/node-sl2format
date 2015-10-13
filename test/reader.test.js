var Code = require('code');   // assertion library
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var stream = require('stream');
var lib = require('../');
var fs = require('fs');
var through2 = require('through2');



lab.experiment('reader', function () {
	lab.test('jox', {timeout: 30000}, function (done) {
		

		function t (chunk, encoding, next) {
			var s = JSON.stringify(chunk) + '\n';
			this.push(s);
			next();
		}

		var rs = fs.createReadStream(__dirname + '/fixtures/small.sl2')
		.pipe(new lib.Reader())
		.pipe(through2.obj(t))
		//.pipe(new stream.Transform({transform: t}))
		.pipe(fs.createWriteStream(__dirname + '/out/small.json'));

		rs.on('end', function () {
			done();
		});
	});
});
