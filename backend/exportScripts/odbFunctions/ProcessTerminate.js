//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
r

//name
ProcessTerminate

//language
javascript

//code
var db = orient.getDatabase();

db.command("DELETE VERTEX WATCHLIST WHERE Organisation = '"+r.field("Organisation")+"' AND Hostname = '"+r.field("Hostname")+"' AND ProcessGuid = '"+r.field("ProcessGuid")+"'"); 

ConnectToProcessCreate(r);


