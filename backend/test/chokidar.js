const chokidar = require('chokidar');
require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l')

// One-liner for current directory, ignores .dotfiles
chokidar.watch('/Users/jymcheong/eventUpload', {ignored: /(^|[\/\\])\../, persistent: true}).on('all', (event, path) => {
  console.log(event, path);
});