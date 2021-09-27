//@type
d

//parameters
jsondata,organisation

//name
AddEvent

//language
javascript

//code
var db = orient.getDatabase();
db.command('INSERT INTO queue SET event = ?, organisation = ?, insertedtime = date()', jsondata, organisation)


