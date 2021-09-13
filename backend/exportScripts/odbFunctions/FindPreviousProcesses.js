//@type
d

//parameters
pc_rid,n

//name
FindPreviousProcesses

//language
javascript

//code
try{
  
    var db = orient.getDatabase();

    // fetch ProcessCreate
    // use date within EventTime, set the rest to 00:00:00
    var pc = db.query('SELECT *, EventTime.format("yyyy-MM-dd 00:00:00") as ET FROM ' + pc_rid)
    if(pc.length == 0) return
    pc = pc[0]

    // setup the SQL statement
    var stm = "select from (select from processcreate where Organisation = ? AND Hostname = ? AND EventTime >= ? AND EventTime <= ?) where id <= ? order by id desc limit " + n

    // fetch N prior ProcessCreates
    var earlierProcesses = db.query(stm, pc.field('Organisation'), pc.field('Hostname'), pc.field('ET'), pc.field('EventTime'), pc.field('id'))
    if(earlierProcesses.length == 0) return

    // link them starting from the earliest
    for(i = earlierProcesses.length - 1; i >=1; i--) {
      //print( earlierProcesses[i].field('EventTime') + ' ' + earlierProcesses[i].field('Image') + ' to ' + earlierProcesses[i -1].field('Image'))
      if(earlierProcesses[i].field('out_FollowedBy') == undefined) 
         retry("db.command('CREATE EDGE FollowedBy FROM " + earlierProcesses[i].field('@rid') + " to " + earlierProcesses[i - 1].field('@rid') + "')") 
    }

}
catch(err){
  var msg = 'FindPreviousProcesses: ' + err + ' | input: ' + pc_rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "FindPreviousProcesses", Message = ?', msg)
}

