//@type
d

//parameters
r

//name
ConnectToProcessCreate

//language
javascript

//code
// r is a non-ProcessCreate event, find ProcessCreate then link it to this event
try{
    var db = orient.getDatabase();
    var rid = r.field('@rid')
    var pc = db.query('SELECT FROM ProcessCreate where Organisation = ? AND Hostname = ? AND ProcessGuid = ? limit 1', r.field('Organisation'), r.field('Hostname'), r.field('ProcessGuid'))

    //regardless ProcessCreate exist or not, the non-ProcessCreate is processed
    retry("db.command('UPDATE "+ rid + " SET ToBeProcessed = false')") 
    if(pc.length == 0) return

    var sql = 'CREATE EDGE ' + edgeLookup(r.field('@class')) + ' FROM ' + pc[0].field('@rid') + ' TO ' + rid
    retry("db.command('" + sql + "')")
}
catch(err){
  var msg = 'ConnectToProcessCreate: ' + err + ' | input: ' + r.field('@rid')
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "ConnectToProcessCreate", Message = ?', msg)
}

