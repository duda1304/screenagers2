var fs = require('fs');
var path = require('path');

const blacklist = [
  // # All
  '^npm-debug\\.log$', // Error log for npm
  '^\\..*\\.swp$', // Swap file for vim state

  // # macOS
  '^\\.DS_Store$', // Stores custom folder attributes
  '^\\.AppleDouble$', // Stores additional file resources
  '^\\.LSOverride$', // Contains the absolute path to the app to be used
  '^Icon\\r$', // Custom Finder icon: http://superuser.com/questions/298785/icon-file-on-os-x-desktop
  '^\\._.*', // Thumbnail
  '^\\.Spotlight-V100(?:$|\\/)', // Directory that might appear on external disk
  '\\.Trashes', // File that might appear on external disk
  '^__MACOSX$', // Resource fork

  // # Linux
  '~$', // Backup file

  // # Windows
  '^Thumbs\\.db$', // Image file cache
  '^ehthumbs\\.db$', // Folder config file
  '^Desktop\\.ini$', // Stores custom folder attributes
  '@eaDir$' // Synology Diskstation "hidden" folder where the server stores thumbnails
];

var regex = new RegExp(blacklist.join('|'));

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    if (!regex.test(file)) {
      filelist = fs.statSync(path.join(dir, file)).isDirectory()
        ? walkSync(path.join(dir, file), filelist)
        : filelist.concat(path.join(dir, file));
    }
  });
  return filelist;
};

function formatDate(date) {
  var d = String(date.getDate()).padStart(2, '0');
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var y = String(date.getFullYear()).slice(2);
  var H = String(date.getHours()).padStart(2, '0');
  var M = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}_${H}h${M}`;
}

module.exports = {
  walkSync,
  formatDate
};

