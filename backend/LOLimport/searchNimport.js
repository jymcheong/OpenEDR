const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const connectODB = require('../../common/orientdb').connectODB;

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
      let contents = fs.readFileSync(fullpath, 'utf8').replace('---\n','').replace('---','')
      const doc = yaml.safeLoad(contents);
      resolve(doc)
    }
    catch (e) {
      console.log(e);
      reject(e);
    }  
  })
}


(async function(){
  _session = await connectODB()
  console.log('connected to target ODB!')

  var files = searchRecursive('./backend/LOLimport/data', '.yml'); // replace dir and pattern
  for(var i = 0; i < files.length; i++){
      try {
        const doc = await parseYML(files[i]);
        doc.Commands.forEach(async element => {
          console.log(element.Command)
          // import to ODB with UPSERT to avoid repeated CommandLine
          let c = await _session.command('UPDATE clc SET Score = 20, CommandLine = :c, MitreLink = :l UPSERT RETURN AFTER @rid WHERE CommandLine = :c', { params : {c: element.Command, l: element.MitreLink}}).all()    
          console.log(c)
        })
      } catch (e){
            console.log(e)
       }
    }
})();