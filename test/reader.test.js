var Code = require('code');   // assertion library
var expect = Code.expect;
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var stream = require('stream');
var lib = require('../');
var fs = require('fs');
var through2 = require('through2');



lab.experiment('reader', function () {
	lab.test('jox',  function (done) {
		var count = 0;
		function t (chunk, encoding, next) {
			var s = JSON.stringify(chunk) + '\n';
			this.push(s);
			count++;
			next();
		}
		var reader = new lib.Reader();
		var ws = fs.createWriteStream(__dirname + '/out/small.json');
		var rs = fs.createReadStream(__dirname + '/fixtures/small.sl2')
		.pipe(reader)
		.pipe(through2.obj(t))
		//.pipe(new stream.Transform({transform: t}))
		.pipe(ws);

		ws.on('finish', function () {
			expect(count).to.equal(4017);
			console.log('ws finish');
			done();
		});

	});
});
