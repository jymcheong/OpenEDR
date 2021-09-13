//@type
d

//parameters
r

//name
CheckSpoof

//language
javascript

//code
// links true parent Process to the child process has spoofed Parent PID
try {
    var db = orient.getDatabase();
    var rid = r.field('@rid')
    var spoof = db.query('SELECT @rid, TrueParentProcessId FROM SpoofParentProcessId \
                              Where Hostname = ? AND Organisation = ? AND ProcessGuid = ?', r.field('Hostname'), 		                      r.field('Organisation'), r.field('ProcessGuid'));
    if(spoof.length == 0) return

    print('\nfound spoof for ' + rid + ' true parentPID = ' + spoof[0].field('TrueParentProcessId') + '\n')
    retry("db.command('CREATE EDGE SpoofedParentProcess FROM " + spoof[0].field('@rid') + " to " + rid + "')")
    var trueParent = null

    if(spoof[0].field('TrueParentProcessGuid')) {
        print('CheckSpoof searching for true parent using ProcessGuid ' + spoof[0].field('TrueParentProcessGuid'))
        trueParent = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? \
        AND ProcessGuid = ? order by id desc limit 1', r.field('Organisation'), r.field('Hostname'), spoof[0].field('TrueParentProcessGuid'))
        print('Checkspoof trueparent length ' + trueParent.length)
    }
    else {
        print('CheckSpoof searching for true parent using ProcessId ' + spoof[0].field('TrueParentProcessId'))      
        trueParent = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? AND \
        ProcessId = ? order by id desc limit 1',r.field('Organisation'), r.field('Hostname'), spoof[0].field('TrueParentProcessId'))
        print('Checkspoof trueparent length ' + trueParent.length + ' ' + r.field('Organisation') + ' ' + r.field('Hostname'))
    }
    if(trueParent.length > 0) {
     print('CheckSpoof found true parent, linking...')
     retry("db.command('CREATE EDGE TrueParentOf FROM " + trueParent[0].field('@rid') + " to " + rid + "')")
    }

    db.command('UPDATE ? SET ToBeProcessed = false', spoof[0].field('@rid'))
}
catch(err){
  var msg = 'CheckSpoof: ' + err + ' | input: ' + r.field('@rid')
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "CheckSpoof", Message = ?', msg)
}


