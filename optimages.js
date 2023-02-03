var compress_images = require('compress-images');

var inputs = 'images/src/**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif,jfif}';
var outputs = 'images/build/';

const fs = require('fs');

function ensureDirSync(dirpath) {
  try {
    fs.mkdirSync(dirpath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

try {
  ensureDirSync('images/');
  ensureDirSync('images/build/');
  ensureDirSync('images/src/');
} catch (err) {
  console.error(err);
}

compress_images(
  inputs,
  outputs,
  { compress_force: false, statistic: true, autoupdate: false, pathLog: './images/log/' },
  false,
  { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
  { png: { engine: 'pngquant', command: ['--quality=20-50'] } },
  { svg: { engine: 'svgo', command: '--multipass' } },
  { gif: { engine: 'giflossy', command: ['--lossy=100'] } },
  function(error, completed, statistic) {
    console.log('-------------');
    console.log(error);
    console.log(completed);
    console.log(statistic);
    console.log('-------------');
  }
);
