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
TriggerProcessing

//language
javascript

//code
var db = orient.getDatabase();

try {
	db.query("SELECT " + doc.field('FunctionName') + "(" + doc.field('rid') + ")");
}
catch(err) {
    db.command('INSERT INTO Errors Set Command = ?, Message = ?', "TriggerProcessing", err)
    print('Failed @ TriggerProcessing' + err)
}

