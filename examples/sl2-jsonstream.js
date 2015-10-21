#!/usr/bin/env node
/*eslint no-console: 0 */
var fs = require('fs');

var sl2 = require('..');


function main() {
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
  var options = {};
  var fsoptions = {};
  // if (length > 0) {
  //   fsoptions.start = 0;
  //   fsoptions.end = length;
  // }
  var reader = new sl2.Reader(options);

  reader.on('header', function (header) {
    console.log('header', header);
    console.log('-------------------');
  });

  reader.on('data', function (block) {
    console.log(JSON.stringify(block));
    // reader.pause();
    // setTimeout(function () {
    //   reader.resume();
    // }, 1000);
  });


  fs.createReadStream(fil, fsoptions)
  .pipe(reader);
  // .pipe(through2.obj(function (obj, enc, next) {
  //   blocks.push(obj);
  //   this.push(JSON.stringify(obj) + '\n');
  //   next();
  // }))
}

main();
