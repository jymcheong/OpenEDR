//@type
d

//parameters
rid

//name
WhitelistCommandLine

//language
javascript

//code
// rid: string of a ProcessCreate
// traverse in('CommandLineSighted'), out('SimilarTo') from $RID
// Whitelist in this case simply means setting the Score to ZERO.
// There are two classes that Score is used for new & recurring sightings:
// 1) HostUserPrivilegeCommandLine or HUPC
// 2) CommandLineCluster
// Called from frontend.js
try{
    var db = orient.getDatabase();
    var r = db.query("traverse in('CommandLineSighted'), out('SimilarTo') from " + rid);

    for(var i = 0; i < r.length; i++) {
      print('WhitelistCommandLine: ' + r[i].field('@class') )
      if(r[i].field('@class') == 'HostUserPrivilegeCommandLine' || r[i].field('@class') == 'CommandLineCluster')     {
        db.command('update ? set Score = 0, BaseLined = true', r[i].field('@rid'));
      }
    }
}
catch(err){
  var msg = 'WhitelistCommandLine: ' + err + ' | input: ' + rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "WhitelistCommandLine", Message = ?', msg)
}

