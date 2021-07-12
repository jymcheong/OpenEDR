//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
null

//name
PendingTypeTimer

//language
javascript

//code
var db = orient.getDatabase();
var p = db.query('select from (select (sysdate().asLong() - Created.asLong())/(1000) as Tdiff, *  from pendingtype) where Tdiff > 90')
if(p.length > 0) print('PendingProcessType total: ' + p.length)
for(var i = 0; i < p.length; i++) {
   if(p[i].field('in').field('ProcessType')) continue
   retry("db.command('UPDATE " + p[i].field('in').field('@rid') + " SET ProcessType = \"AfterExplorerBackground\"" + "')")
   retry("db.command('DELETE EDGE " + p[i].field('@rid') + "')")
}

//clean up triggerprocessing
db.command('delete from tp where (sysdate().asLong() - TimeStamp.asLong())/1000 > 90') 

