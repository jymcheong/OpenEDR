//@type
d

//parameters
e

//name
DataFuseUserActions

//language
javascript

//code
// pre-processing routine called by ProcessEvent
try{
    var db = orient.getDatabase();
    e['_classname'] = 'UserActionTracking'
    delete e['ProcessID']
    try {
        var uat = JSON.parse(e['Message'])
    }
    catch(err) {
        print(Date() + ' Offending DataFuseUserActions ' + e['Message'])
        db.command('INSERT INTO FailedJSON SET line = ?', logline)
        return 0
    }
    for(var k in uat){ e[k] = uat[k] }
    return e
}
catch(err){
  var msg = 'DataFuseUserActions: ' + err + ' | input: ' + JSON.stringify(e)
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "DataFuseUserActions", Message = ?', msg)
}

