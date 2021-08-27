//@type
d

//parameters
rid

//name
LinkNonProcessCreate

//language
javascript

//code
// rid of a ProcessCreate record 
// this is called from frontend.js
try{
    var db = orient.getDatabase();
    var r = db.query("SELECT FROM " + rid)
    if(r.length == 0) return
    r = r[0]

    var e = db.query("select from Sysmon where Organisation = ? AND Hostname = ? AND ProcessGuid = ? AND ToBeProcessed = true AND @rid <> ?", r.field("Organisation"), r.field("Hostname"), r.field("ProcessGuid"), rid)
    if(e.length == 0) return

    for(var i = 0; i < e.length; i++){
      if(e[i].field('@class') == "CreateRemoteThread" || e[i].field('@class') == "ProcessAccess"){
          this[e[i].field('@class')](e[i])
      }
      else{
            var sql = 'CREATE EDGE ' + edgeLookup(e[i].field('@class')) + ' FROM ' + rid + ' TO ' + e[i].field('@rid')
           retry("db.command('" + sql + "')")
           retry("db.command('UPDATE "+ e[i].field('@rid') + " SET ToBeProcessed = false')")
      }
    } 

}
catch(err){
  var msg = 'LinkNonProcessCreate: ' + err + ' | input: ' + rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "LinkNonProcessCreate", Message = ?', msg)
}

