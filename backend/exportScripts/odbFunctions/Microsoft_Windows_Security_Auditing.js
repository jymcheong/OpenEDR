//@type
d

//parameters
e

//name
Microsoft_Windows_Security_Auditing

//language
javascript

//code
// Microsoft_Windows_Security_Auditing function
// pre-processing routine called by ProcessEvent
try{
    var db = orient.getDatabase();
    if(e.EventID == 4689) e["_classname"] = 'TerminatedProcess4689'

    if(e.EventID == 4688){
      e["_classname"] = 'CreatedProcess4688'  
      if('Sequence' in e) UpdateLineageLookup(e)
    }
    return e
}
catch(err){
  var msg = 'Microsoft_Windows_Security_Auditing: ' + err + ' | input: ' + JSON.stringify(e)
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "Microsoft_Windows_Security_Auditing", Message = ?', msg)
}

