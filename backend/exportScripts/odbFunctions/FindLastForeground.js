//@type
d

//parameters
pc_rid

//name
FindLastForeground

//language
javascript

//code
// frontend.js calls this
try{
    var db = orient.getDatabase();

    // fetch ProcessCreate
    var pc = db.query('SELECT *, EventTime.format("yyyy-MM-dd 00:00:00") as ET, in("LastForeground").size() as LFG FROM ' + pc_rid)
    if(pc.length == 0) return
    pc = pc[0]

    // already linked
    if(pc.field('LFG') > 0) return

    var fgProcess = db.query("select from processcreate where Organisation = ? AND Hostname = ? AND id < ? AND (ProcessType = 'AfterExplorerForeground' OR (Image like '%explorer.exe' AND ProcessType = 'BeforeExplorer')) order by id desc limit 1", pc.field('Organisation'), pc.field('Hostname'), pc.field('id'))

    if(fgProcess.length == 0) return

    print('Found last FG process @ ' +  fgProcess[0].field('EventTime') + ' ' + fgProcess[0].field('Image') + ' for ' + pc_rid)

    retry("db.command('CREATE EDGE LastForeground FROM " + fgProcess[0].field('@rid') + " to " + pc_rid + "')")

}
catch(err){
  var msg = 'FindLastForeground: ' + err + ' | input: ' + pc_rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "FindLastForeground", Message = ?', msg)
}

