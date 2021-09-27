//@type
d

//parameters
e

//name
UpdateLineageLookup

//language
javascript

//code
// called by Microsoft_Windows_Security_Auditing to use 4688 events to update lineage lookup table
try{
    var db = orient.getDatabase();

    if(!('NewProcessName' in e)) return // can't do anything

    if('Sequence' in e){
       print('Using early sequence: ' + e.Sequence)
       db.command('UPDATE LineageLookup set Sequence = ?, Image = ?\
                   UPSERT WHERE Organisation = ? AND Hostname = ? AND PID = ?', 
                  e.Sequence, e.NewProcessName, e.Organisation, e.Hostname, e.PID)
    }
    else{
      if(!('CreatorProcessName' in e)) return // can't do anything
      var parent = db.query('select Sequence from LineageLookup WHERE Organisation = ? AND Hostname = ? AND PID = ? AND Image = ?', 
                            e.Organisation, e.Hostname, e.PPID, e.CreatorProcessName)
      
      if(parent.length == 0) return // will try again when ProcessEvent:ProcessCreate 
      
      var newProcessEXEname = e.NewProcessName.split('\\').reverse()[0];
      var newSequence = parent[0].field('Sequence') + ' > ' + newProcessEXEname
      if(newSequence.indexOf('null') < 0) {
      	e.Sequence = newSequence
        db.command('UPDATE LineageLookup set Sequence = ?, Image = ? UPSERT WHERE Organisation = ? AND Hostname = ? AND PID = ?', 
						newSequence, e.NewProcessName, e.Organisation, e.Hostname, e.PID)
      }
      //print('UpdateLineageLookup: ' + newSequence)
    }
}
catch(err){
  var msg = 'UpdateLineageLookup: ' + err + ' | input: ' + JSON.stringify(e)
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "UpdateLineageLookup", Message = ?', msg)
}

