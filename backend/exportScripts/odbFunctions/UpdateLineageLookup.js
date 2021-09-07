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
                   UPSERT WHERE Organisation = ? AND Hostname = ? AND PID = 4 AND PPID = 0', e.Organisation, e.Hostname)
       db.command('UPDATE LineageLookup set Sequence = "System > smss.exe" \
                   UPSERT WHERE Organisation = ? AND Hostname = ? AND PID = ? AND PPID = 4 AND Image = ?', e.Organisation, e.Hostname, e.PID, e.NewProcessName)
    }
    else{
      var parent = db.query('select Sequence from LineageLookup WHERE Organisation = ? AND Hostname = ? AND PID = ? AND Image = ?', 
                            e.Organisation, e.Hostname, e.PPID, e.CreatorProcessName)
      if(parent.length > 0) {
        var newProcessEXEname = e.NewProcessName.split('\\').reverse()[0];
        var newSequence = parent[0].field('Sequence') + ' > ' + newProcessEXEname
        if(newSequence.indexOf('null') < 0) {
        	e.Sequence = newSequence
        	db.command('UPDATE LineageLookup set Sequence = ? UPSERT WHERE Organisation = ? AND Hostname = ? \
                    AND PID = ? AND PPID = ? AND Image = ?', newSequence, e.Organisation, e.Hostname, e.PID, e.PPID, e.NewProcessName)
        }
        //print('UpdateLineageLookup: ' + newSequence)
      }
      else {
        print('UpdateLineageLookup could not find parent sequence for processPID: ' + e.PID + ' with PPID: ' + e.PPID + ' > ' + e.NewProcessName)
      }
    }
}
catch(err){
  var msg = 'UpdateLineageLookup: ' + err + ' | input: ' + JSON.stringify(e)
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "UpdateLineageLookup", Message = ?', msg)
}

