//@type
d

//parameters
jsondata,organisation

//name
dequeue

//language
javascript

//code
var db = orient.getDatabase();

var BATCHSIZE = 100

var events = db.command('delete from queue return before limit ?', BATCHSIZE)
for(var i = 0; i < events.length; i++) {
	ProcessEvent(events[i].field('event'), events[i].field('organisation'))
}
 

