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
SpoofParentProcessId

//language
javascript

//code
/*
  SpoofParentProcessId vertice will be linked to a ProcessCreate that has spoof parent PID by edge:SpoofedParentProcess.
  Another edge:TrueParentOf links the actual parent Process to this process with spoofed PPID.
*/

var db = orient.getDatabase();
var rid = r.field('@rid')

print('spoofed PPID processGuid: ' + r.field('ProcessGuid'))
print('True-parent processGuid: ' + r.field('TrueParentProcessGuid'))

// link spoof alert vertex to ProcessCreate
var targetPC = db.query('SELECT FROM ProcessCreate WHERE ProcessGuid = ? AND Hostname = ? AND Organisation = ? limit 1',
                        r.field('ProcessGuid'), r.field('Hostname'), r.field('Organisation') )
if(targetPC.length == 0) return
targetPC = targetPC[0]
retry("db.command('CREATE EDGE SpoofedParentProcess FROM " + rid + " to " + targetPC.field('@rid') + "')")

// link true-parent ProcessCreate to ProcessCreate with spoofed PPID
var trueParent = null
if(r.field('TrueParentProcessGuid')) {
	trueParent = db.query('SELECT FROM ProcessCreate WHERE ProcessGuid = ? AND Hostname = ? \
AND Organisation = ? limit 1', r.field('TrueParentProcessGuid'), r.field('Hostname'), r.field('Organisation') )
}
else{
	trueParent = db.query('SELECT FROM ProcessCreate WHERE ProcessId = ? AND Hostname = ? \
AND Organisation = ? limit 1', r.field('TrueParentProcessId'), r.field('Hostname'), r.field('Organisation') )
}

if(trueParent.length == 0) return
trueParent = trueParent[0]
retry("db.command('CREATE EDGE TrueParentOf FROM " + trueParent.field('@rid') + " to " + targetPC.field('@rid') + "')")
retry("db.command('UPDATE "+ rid + " SET ToBeProcessed = false')")

