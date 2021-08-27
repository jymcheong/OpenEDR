//@type
d

//parameters
r

//name
ProcessTerminate

//language
javascript

//code
try{
    var db = orient.getDatabase();

    db.command("DELETE VERTEX WATCHLIST WHERE Organisation = '"+r.field("Organisation")+"' AND Hostname = '"+r.field("Hostname")+"' AND ProcessGuid = '"+r.field("ProcessGuid")+"'"); 

    ConnectToProcessCreate(r);

}
catch(err){
  var msg = 'ProcessTerminate: ' + err + ' | input: ' + r.field('@rid')
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "ProcessTerminate", Message = ?', msg)
}

