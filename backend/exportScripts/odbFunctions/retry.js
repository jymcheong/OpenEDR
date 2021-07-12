//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
command

//name
retry

//language
javascript

//code
// used for UPDATE & CREATE EDGE retries
var db = orient.getDatabase();

try {
	eval(command) 
}
catch(err){
	var e = '' + err
    if(e.indexOf('UPDATE') > 0) {
    	print('Retrying ' + command)
    	retry(command)
	}
	else {
    	db.command('INSERT INTO Errors Set Command = ?, Message = ?',command, e)
        print('Failed: ' + command + ' | Error: ' + e)
	}
}


