//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
r

//name
UntrustedFile

//language
javascript

//code
var db = orient.getDatabase();
//var r = db.query("SELECT FROM " + rid);
//if(r.length == 0) return;
//r = r[0];
var rid = r.field('@rid')
print('UntrustedFile found on ' + r.field('Hostname'));

function findProcessCreate(r){
  return db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? AND ProcessGuid = ? limit 1', r.field('Organisation'), r.field('Hostname'), r.field('ProcessGuid'));
}

// UntrustedFile is usually inserted before ProcessCreate/ImageLoad 
// the following handles scenario when UntrustedFile is inserted later.
var pc = null;

var linkSQL = "";

if(r.field('Type') == 'ProcessCreate') {
  	pc = findProcessCreate(r)
    if(pc.length > 0) linkSQL = "db.command('CREATE EDGE ExeSighted FROM " + rid +" TO " + pc[0].field('@rid') + "')" 
}
else {
	pc = db.query('SELECT FROM ImageLoad where Hostname = ? AND Organisation = ? AND ProcessGuid = ? AND ImageLoaded = ?',
                   r.field('Hostname'), r.field('Organisation'), r.field('ProcessGuid'),r.field('FullPath'))
    if(pc.length > 0) { linkSQL = "db.command('CREATE EDGE DllSighted FROM " + rid +" TO " + pc[0].field('@rid') + "')" }
    else {
       pc = findProcessCreate(r)
       if(pc.length > 0)  linkSQL = "db.command('CREATE EDGE DllSighted FROM " + pc[0].field('@rid') +" TO " + rid + "')"
    }
}    
if(pc.length == 0) return

print('linking foreign ' + r.field('Type') + ' ' + pc[0].field('@rid'))
retry(linkSQL)
retry("db.command('UPDATE " + rid + " SET ToBeProcessed = false')")
findExecuteAfterWrite(r.field('FullPath'), pc[0].field('Hostname'), pc[0].field('Organisation'), pc[0].field('@rid'))


