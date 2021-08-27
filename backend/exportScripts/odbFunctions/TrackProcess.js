//@type
d

//parameters
r

//name
TrackProcess

//language
javascript

//code
try{
  
    var db = orient.getDatabase();

    // ImageHashes tracking
    var u = db.command('UPDATE ImageHashes set Count = Count + 1 UPSERT RETURN AFTER @rid, Count \
                        WHERE Image = ? AND Hashes = ?', r.field('Image'), r.field('Hashes'))
    u = db.command('UPDATE ImageHashes set HashCount = HashCount + 1 \
                            RETURN AFTER @rid, Count, HashCount, BaseLined WHERE Hashes = ?',r.field('Hashes'))
    var IHT_rid = u[0].field('@rid')

    // CommandLine tracking
    u = db.command('UPDATE HostUserPrivilegeCommandLine set Count = Count + 1 \
                    UPSERT RETURN AFTER @rid, Count, Score WHERE \
                    Hostname = ? AND Organisation = ? AND User = ? AND CommandLine = ? AND IntegrityLevel = ?',r.field('Hostname'),r.field('Organisation'),r.field('User'),r.field('CommandLine'),r.field('IntegrityLevel'))	
    var HUPC_rid = u[0].field('@rid')

            // Reboot Tracking
    if(r.field('ParentImage').indexOf('dfpm.exe') > 0 && r.field('Image').indexOf('shutdown.exe') > 0) {
        retry("db.command('CREATE EDGE Rebooted from "+HUPC_rid+" TO "+r.field('@rid')+"')")
        print(r.field('Hostname') + ' reboot command issued')
    }

    // assign if any exact same commandline with existing score > 0
    var score = db.query('select from commandlinecluster \
                        where Score > 0 AND CommandLine = ?',r.field('CommandLine'))
    // note OR condition
    if(u[0].getProperty('Count') == 1 || score.length > 0 || u[0].field('Score') > 0) {
        retry("db.command('CREATE EDGE CommandLineSighted FROM "+HUPC_rid+" TO "+r.field('@rid')+"')")
        retry("db.command('CREATE EDGE HasHashes FROM "+HUPC_rid+" to "+IHT_rid+"')")
        //print('CommandLineSighted ' + r.field('CommandLine'))
	}
}
catch(err){
  var msg = 'TrackProcess: ' + err + ' | input: ' + r.field('@rid')
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "TrackProcess", Message = ?', msg)
}

