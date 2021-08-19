//@type
d

//parameters
e

//name
DataFuseUserActions

//language
javascript

//code
// pre-processing routine called by AddEvent
var db = orient.getDatabase();
e['_classname'] = 'UserActionTracking'
delete e['ProcessID']
try {
	var uat = JSON.parse(e['Message'])
}
catch(err) {
	print(Date() + ' Offending DataFuseUserActions ' + e['Message'])
    //print(logline)
    db.command('INSERT INTO FailedJSON SET line = ?', logline)
    return 0
}
for(var k in uat){ e[k] = uat[k] }
return e

