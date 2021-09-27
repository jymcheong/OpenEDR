//@type
d

//parameters
e

//name
CheckProcessWatchlist

//language
javascript

//code
// called by ProcessEvent, returns WatchList record if found, else return null
try{
    var db = orient.getDatabase();
    var wpc = db.query('SELECT FROM WatchList WHERE Organisation = ? AND Hostname = ? \
              AND ProcessGuid = ?', e.Organisation, e.Hostname, e.ProcessGuid)
    if(wpc.length == 0) return null
	// we assign this id so that the triggered function can look for events b4 this id
    if(wpc[0].field('id') == null) {
        retry("db.command('UPDATE " + wpc[0].field('@rid') + " SET id = " + e.id + "')")
        LinkWatchListRecord(wpc)
    }
    return wpc[0]
}
catch(err){
  var msg = 'CheckProcessWatchlist: ' + err + ' | input: ' + JSON.stringify(e)
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "CheckProcessWatchlist", Message = ?', msg)
}

