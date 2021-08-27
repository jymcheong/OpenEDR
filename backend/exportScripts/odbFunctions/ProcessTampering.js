//@type
d

//parameters
r

//name
ProcessTampering

//language
javascript

//code
try{
    var db = orient.getDatabase();
    var pc = db.query('SELECT from ProcessCreate WHERE Hostname = ? AND Organisation = ? AND ProcessGuid = ?',r.field('Hostname'),r.field('Organisation'),r.field('ProcessGuid'))	

    if(pc.length > 0) {
    var n = db.query("traverse in('CommandLineSighted'), out('SimilarTo') from " + pc[0].field('@rid'));
      for(var i = 0; i < n.length; i++) {
         if(n[i].field('BaseLined') == true) {
            print('ProcessTampering found whitelisted')
            return;
         }
      }  
      ConnectToProcessCreate(r);
    }
// it is possible to have missing ProcessCreate while still capturing ProcessTampering events
// something to consider how to deal with orphan ProcessTamper
}
catch(err){
  var msg = 'ProcessTampering: ' + err + ' | input: ' + r.field('@rid')
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "ProcessTampering", Message = ?', msg)
}


