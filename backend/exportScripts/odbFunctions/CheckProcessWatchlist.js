//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
e

//name
CheckProcessWatchlist

//language
javascript

//code
var db = orient.getDatabase();
var wpc = db.query('SELECT FROM WatchList WHERE Organisation = ? AND Hostname = ? \
		  AND ProcessGuid = ?', e['Organisation'], e['Hostname'], e['ProcessGuid'])

if(wpc.length == 0) return null

if(wpc[0].field('id') == null) {
	// we assign this id so that the triggered function can look for events b4 this id
    retry("db.command('UPDATE " + wpc[0].field('@rid') + " SET id = " + e['id'] + "')")
    LinkWatchListRecord(wpc)
}

return wpc[0]

