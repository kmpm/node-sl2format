var fs = require('fs');
//var path = require('path');
var util = require('util');


function main() {
  var bytes = parseInt(process.argv[2]);
  var fil = process.argv[3];

  var stats = fs.statSync(fil);
  if (stats.isFile()) {
    doFile(fil, bytes);
  }
}

function doFile(inFile, bytes) {
  //console.log('getting %d bytes from %s', bytes, inFile);
  var outFile = inFile + util.format('.%d', bytes);

  fs.createReadStream(inFile, {
    start: 0,
    end: bytes - 1
  })
  .pipe(fs.createWriteStream(outFile));
}

main();
