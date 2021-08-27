//@type
d

//parameters
null

//name
RestartTimers

//language
javascript

//code
// Called from insertEvent.js; not in use

var db = orient.getDatabase();

// PendingTypeTimer functions sets ProcessType to AfterExplorerBackground 
db.command('DELETE FROM oschedule WHERE name = "PendingTypeEvent"')
db.command("INSERT INTO oschedule  SET name = 'PendingTypeEvent', \
			function = (SELECT FROM ofunction WHERE name = 'PendingTypeTimer'), rule = '0/10 * * * * ?'")

// ConnectParentProcess links child to parent process
db.command('DELETE FROM oschedule WHERE name = "ConnectParentEvent"')
db.command("INSERT INTO oschedule  SET name = 'ConnectParentEvent', \
			function = (SELECT FROM ofunction WHERE name = 'ConnectParentProcess'), rule = '0/1 * * * * ?'")

