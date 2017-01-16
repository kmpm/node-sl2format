#!/usr/bin/env node
/*eslint no-console: 0 */
var fs = require('fs');

var sl2 = require('..'); //require('sl2format');


function main() {
  if (process.argv.length < 3) {
    console.error('Must provide at least 1 log file as argument');
    process.exit(1);
  }
  for (var i = 2; i < process.argv.length; i++) {
    var fil = process.argv[i];
    var stats = fs.statSync(fil);
    if (stats.isFile()) {
      console.log('file size: %s', stats.size);
      doFile(fil);
    }
  }
}


function doFile(fil) {
  var options = {
    feetToMeter: true, //default false
    convertProjection: true, //default false
    radToDeg: true //default false
  };
  var fsoptions = {};

  var reader = new sl2.Reader(options);

  reader.on('header', function (header) {
    console.log('header', header);
    console.log('-------------------');
  });

  reader.on('data', function (block) {
    console.log(JSON.stringify(block));
  });


  fs.createReadStream(fil, fsoptions)
  .pipe(reader);
}

main();
