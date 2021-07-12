//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
searchFilename,Hostname,Organisation,pc_rid

//name
findExecuteAfterWrite

//language
javascript

//code
var db = orient.getDatabase();

// use Image/ImageLoaded string to search last FileCreate 
print('\nSearching for FileCreate ' + searchFilename + '\n');
var foundFile = db.query('SELECT FROM FileCreate WHERE Hostname = ? AND Organisation = ? AND \
     TargetFilename = ? order by id desc limit 1', Hostname, Organisation, searchFilename);

if(foundFile.length == 0) return 

print('Found for FileCreate ' + searchFilename + '\n');	
retry("db.command('CREATE EDGE ExecuteAfterWrite FROM " + foundFile[0].field('@rid') + " to " + pc_rid + "')")


