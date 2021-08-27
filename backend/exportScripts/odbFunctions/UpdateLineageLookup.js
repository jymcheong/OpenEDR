//@type
d

//parameters
e

//name
UpdateLineageLookup

//language
javascript

//code
// called by Microsoft_Windows_Security_Auditing to use 4688 to update lineage lookup table
try{
    var db = orient.getDatabase();

    if(!('NewProcessName' in e)) return // can't do anything

    if(e.PPID == 4 && e.NewProcessName.indexOf('smss.exe') > 0){
       print('')
       print('======= found first smss.exe in 4688 ====== for ' + e.Organisation + '|' + e.Hostname)
       e.Sequence = 'System > smss.exe'
       db.command('UPDATE LineageLookup set Sequence = "System" \
                   UPSERT WHERE Organisation = ? AND Hostname = ? AND PID = 4', e.Organisation, e.Hostname)
       db.command('UPDATE LineageLookup set Sequence = "System > smss.exe" \
                   UPSERT WHERE Organisation = ? AND Hostname = ? AND PID = ?', e.Organisation, e.Hostname, e.PID)
    }
    else{
      var parent = db.query('select Sequence from LineageLookup WHERE Organisation = ? AND Hostname = ? AND PID = ? order by @rid desc limit 1', 
                            e.Organisation, e.Hostname, e.PPID)
      if(parent.length > 0) {
        var newProcessEXEname = e.NewProcessName.split('\\').reverse()[0];
        var newSequence = parent[0].field('Sequence') + ' > ' + newProcessEXEname
        e.Sequence = newSequence
        db.command('UPDATE LineageLookup set Sequence = ? UPSERT WHERE Organisation = ? AND Hostname = ? \
                    AND PID = ?', newSequence, e.Organisation, e.Hostname, e.PID)
        //print('UpdateLineageLookup: ' + newSequence)
      }
      else {
        print('UpdateLineageLookup could not find parent sequence for processPID: ' + e.PID + ' with PPID: ' + e.PPID)
      }
    }
}
catch(err){
  var msg = 'UpdateLineageLookup: ' + err + ' | input: ' + JSON.stringify(e)
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "UpdateLineageLookup", Message = ?', msg)
}

