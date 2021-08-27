//@type
d

//parameters
r

//name
ProcessAccess

//language
javascript

//code
try{
    var db = orient.getDatabase();
    var rid = r.field('@rid')

    var source = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? AND ProcessGuid = ? limit 1', 
                          r.field('Organisation'), r.field('Hostname'),  r.field('SourceProcessGuid'));

    if(source.length > 0) {
        retry("db.command('CREATE EDGE ProcessAccessedFrom FROM " + source[0].field('rid').field('@rid') + " TO " + rid + "')")
    }

    var target = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? AND ProcessGuid = ? limit 1', 
                          r.field('Organisation'), r.field('Hostname'), r.field('TargetProcessGuid'))

    if(target.length > 0) {
        retry("db.command('CREATE EDGE ProcessAccessedTo FROM " + rid + " TO " + target[0].field('rid').field('@rid') + "')")
    }

    retry("db.command('UPDATE "+ rid + " SET ToBeProcessed = false')") 
}
catch(err){
  var msg = 'ProcessAccess: ' + err + ' | input: ' + rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "ProcessAccess", Message = ?', msg)
}

