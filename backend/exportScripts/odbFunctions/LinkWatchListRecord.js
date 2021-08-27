//@type
d

//parameters
r

//name
LinkWatchListRecord

//language
javascript

//code
// rid of a WatchList record 
// called by CheckProcessWatchlist
try{
    var db = orient.getDatabase();
    r = r[0]
    var rid = r.field('@rid')

    var e = db.query("select from Sysmon where Organisation = ? AND Hostname = ? AND ProcessGuid = ? AND ToBeProcessed = true AND @rid <> ? AND id < ?", r.field("Organisation"), r.field("Hostname"), r.field("ProcessGuid"), r.field("PCrid"), r.field("id"))
    if(e.length == 0) return

    for(var i = 0; i < e.length; i++){
      if(e[i].field('@class') == "CreateRemoteThread" || e[i].field('@class') == "ProcessAccess"){
          this[e[i].field('@class')](e[i])
      }
      else{ // this links directly to ProcessCreate
            var sql = 'CREATE EDGE ' + edgeLookup(e[i].field('@class')) + ' FROM ' + r.field('PCrid') + ' TO ' + e[i].field('@rid')
           retry("db.command('" + sql + "')")
           retry("db.command('UPDATE "+ e[i].field('@rid') + " SET ToBeProcessed = false')")
      }
    }

}
catch(err){
  var msg = 'LinkWatchListRecord: ' + err + ' | input: ' + rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "LinkWatchListRecord", Message = ?', msg)
}

