//@type
d

//parameters
r

//name
CheckSpoof

//language
javascript

//code
var db = orient.getDatabase();
var rid = r.field('@rid')
var spoof = db.query('SELECT @rid, TrueParentProcessId FROM SpoofParentProcessId \
                          Where Hostname = ? AND Organisation = ? AND ProcessGuid = ?', r.field('Hostname'), 		                      r.field('Organisation'), r.field('ProcessGuid'));
if(spoof.length == 0) return
    
print('\nfound spoof for ' + rid + ' true parentPID = ' + spoof[0].field('TrueParentProcessId') + '\n')
retry("db.command('CREATE EDGE SpoofedParentProcess FROM " + spoof[0].field('@rid') + " to " + rid + "')")
var trueParent = null

if(spoof[0].field('TrueParentProcessGuid')) {
	trueParent = db.query('SELECT FROM ProcessCreate WHERE ProcessGuid = ? AND Hostname = ? \
	AND Organisation = ? order by id desc limit 1', spoof[0].field('TrueParentProcessGuid'), r.field('Hostname'), r.field('Organisation') )
}
else {
	trueParent = db.query('SELECT FROM ProcessCreate WHERE ProcessId = ? AND Hostname = ? AND \
	Organisation = ? order by id desc limit 1',spoof[0].field('TrueParentProcessId'), r.field('Hostname'), 		r.field('Organisation') )
}
if(trueParent.length > 0) {
 retry("db.command('CREATE EDGE TrueParentOf FROM " + trueParent[0].field('@rid') + " to " + rid + "')")
}

db.command('UPDATE ? SET ToBeProcessed = false', spoof[0].field('@rid'))

