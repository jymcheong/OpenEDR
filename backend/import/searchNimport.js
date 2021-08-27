const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const odb = new (require('../../common/odb').Odb)();

var searchRecursive = function(dir, pattern) {
  // This is where we store pattern matches of all files inside the directory
  var results = [];

  // Read contents of directory
  fs.readdirSync(dir).forEach(function (dirInner) {
    // Obtain absolute path
    dirInner = path.resolve(dir, dirInner);

    // Get stats to determine if path is a directory or a file
    var stat = fs.statSync(dirInner);

    // If path is a directory, scan it and combine results
    if (stat.isDirectory()) {
      results = results.concat(searchRecursive(dirInner, pattern));
    }

    // If path is a file and ends with pattern then push it onto results
    if (stat.isFile() && dirInner.endsWith(pattern)) {
      results.push(dirInner);
    }
  });

  return results;
};

function parseYML(fullpath){
  return new Promise(async (resolve,reject) => {
    try {
      // unfortunately replaceAll is not available
      let contents = fs.readFileSync(fullpath, 'utf8').replace('---','').replace('---','').trim()
      const doc = yaml.parse(contents);
      resolve(doc)
    }
    catch (e) {
      console.log(e);
      reject(e);
    }  
  })
}

/***
 * LOLdata holds yml directory of https://github.com/LOLBAS-Project/LOLBAS
 */
(async function(){
  _session = await odb.startSession()
  console.log('connected to target ODB!')
  var count = 0;
  var files = searchRecursive('./backend/import/LOLdata', '.yml'); // replace dir and pattern
  for(var i = 0; i < files.length; i++){
      try {
        const doc = await parseYML(files[i]);
        doc.Commands.forEach(async element => {
          console.log(element.Command)
          count++
          // import to ODB with UPSERT to avoid repeated CommandLine
          _session.command('UPDATE clc SET Score = 30, CommandLine = :c, MitreLink = :l UPSERT RETURN AFTER @rid WHERE CommandLine = :c', { params : {c: element.Command, l: element.MitreLink}}).all()              
        })
      } catch (e){
            console.log(files[i])
            console.log(e)
       }
    }
    console.log(count)
})();