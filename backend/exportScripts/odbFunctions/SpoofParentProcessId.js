//@type
d

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
try{

    var db = orient.getDatabase();
    var rid = r.field('@rid')
    
    print('spoofed parent processGuid: ' + r.field('ProcessGuid'))
    print('True-parent processGuid: ' + r.field('TrueParentProcessGuid'))

    // link spoof alert vertex to ProcessCreate
    var targetPC = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? AND ProcessGuid = ? limit 1',
                            r.field('Organisation'), r.field('Hostname'), r.field('ProcessGuid') )
    if(targetPC.length == 0) return
    targetPC = targetPC[0]
    retry("db.command('CREATE EDGE SpoofedParentProcess FROM " + rid + " to " + targetPC.field('@rid') + "')")

    // link true-parent ProcessCreate to ProcessCreate with spoofed PPID
    var trueParent = null
    if(r.field('TrueParentProcessGuid')) {
        print('SpoofParentProcessId using ' + r.field('TrueParentProcessGuid') + ' to find true parent')
        trueParent = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? \
    AND ProcessGuid = ? order by id desc limit 1', r.field('Organisation'), r.field('Hostname'), r.field('TrueParentProcessGuid') )
    }
    else{
        print('SpoofParentProcessId using ' + r.field('TrueParentProcessId') + ' to find true parent')      
        trueParent = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? \
    AND ProcessId = ? order by id desc limit 1', r.field('Organisation'), r.field('Hostname'), r.field('TrueParentProcessId') )
    }

    if(trueParent.length == 0) return
    trueParent = trueParent[0]
    print('SpoofParentProcessId found true parent, linking...')
    retry("db.command('CREATE EDGE TrueParentOf FROM " + trueParent.field('@rid') + " to " + targetPC.field('@rid') + "')")
    retry("db.command('UPDATE "+ rid + " SET ToBeProcessed = false')")

}
catch(err){
  var msg = 'SpoofParentProcessId: ' + err + ' | input: ' + rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "SpoofParentProcessId", Message = ?', msg)
}

