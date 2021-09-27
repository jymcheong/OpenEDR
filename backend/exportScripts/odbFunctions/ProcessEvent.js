//@type
d

//parameters
jsondata,organisation

//name
ProcessEvent

//language
javascript

//code
try {
    var db = orient.getDatabase();

    // process log line sent from insertEvent.js
    var logline = unescape(jsondata)
    if(logline.trim().length == 0) return
    var e = null
    try {
      e = removeSpaceFromKey(JSON.parse(logline));    
    }
    catch(err) {
       print(Date() + err);
       db.command('INSERT INTO FailedJSON SET line = ?', logline)
       return
    }

    // every event gets a unique ID
    var id = (new Date())*1
    e.id = id

    if('Hostname' in e) { e.Hostname = e.Hostname.toUpperCase() }

    //for multi-tenancy support
    if(organisation != undefined) { 
      if(organisation.length > 0) e.Organisation = organisation
    }
    if(!('Organisation' in e)) e.Organisation = 'MyCompany' 

    // default class if can't figure out which class later
    classname = 'WinEvent' 
    e.ToBeProcessed = true

    // This Keywords field is a huge negative number that breaks record insertion
    if('Keywords' in e) e.Keywords = '' + e.Keywords // turn it into a string

    // Pre-insertion processing...
    var funcName = e.SourceName.replace(/-/g,'_')
    if(funcName in this){
        e = this[funcName](e); 
        if(e == 0) return; 
        // pre-processing that needs to continue returns a _classname
        if("_classname" in e) {
           classname = e._classname
           delete e._classname
        }
    }

    //problematic for server-side parsing... it is repeated data anyway
    // it is pre-processed in some functions (eg. DataFuseUserActions) before deleting
    if('Message' in e) delete e.Message 

    //--Insert event------
    var jsonstring = JSON.stringify(e)
    var stmt = 'INSERT INTO '+ classname + ' CONTENT ' + jsonstring
    var r = null
    try { r = db.command(stmt); }
    catch(err){
        print(Date() + ' Error inserting ' + stmt)
        db.command('INSERT INTO FailedJSON SET line = ?', logline)
        return
    }
    //--End insert event------

    // post-insertion processing...
    // Linking edges that need RID of inserted record is done here
    switch(classname) { 
    case "CreatedProcess4688":
            if(!('Sequence' in e)) {
              //print('Post-insertion sequence extraction for 4688 event: ' + e.NewProcessName) 
              UpdateLineageLookup(e)
            }
            break;
        
    case "ProcessCreate":
            CheckForeign(r[0])
            CheckSpoof(r[0])
            TrackBeforeOrAfterExplorer(r[0])
            if('Sequence' in e) {
              TrackLineage(e.Sequence, r[0].field('@rid'), r[0])
            }
        	else { // try to recover & hope that the parent's Sequence is available...
                print('\nProcessEvent extracting Sequence after event insertion...\n')
                var sequence = ''
                var seq = db.query('SELECT FROM LineageLookup WHERE Organisation = ? AND Hostname = ? AND PID = ? AND Image = ?', 
                                   e.Organisation, e.Hostname, e.ParentProcessId, e.ParentImage)
                if(seq.length > 0){ 
                   print('\nProcessEvent:ProcessCreate found in LineageLookup: ' + seq[0].field('Sequence') + '\n')
                   sequence = seq[0].field('Sequence') + ' > ' + e.Image.split('\\').reverse()[0]				   
                }
                else {
                    print('\nProcessEvent retrying with ParentProcessGuid ' + e.Image + '\n')
                    var parent = db.query("select from processcreate where Organisation = ? AND Hostname = ? AND ParentProcessGuid = ? limit 1", e.Organisation, e.Hostname, e.ParentProcessGuid )
                    if(parent.length == 0) {
                       print('ProcessEvent unable to find parent process with ParentProcessGuid ' + e.ParentProcessGuid)
                       break;
                    }
					if(parent[0].field('Sequence')) {
                         sequence = parent[0].field('Sequence') + ' > ' + e.Image.split('\\').reverse()[0]
                    }
                  	else print('\nProcessEvent found parent process with ParentProcessGuid but sequence is null \n')
                }
              
                if(sequence.length > 0) {
                   print('ProcessEvent:ProcessCreate updated Sequence...')
                   retry("db.command('UPDATE "+ r[0].field('@rid') + " SET Sequence = \"" + sequence + "\"')")
                   TrackLineage(sequence, r[0].field('@rid'), r[0])
                }
            }
            break;

    case "ImageLoad": //most signed Microsoft DLL are filtered by nxlog.conf
            CheckForeign(r[0])
            // track full-path-to-file AND Hashes
            db.command('UPDATE ImageLoadedHashes set Count = Count + 1 UPSERT RETURN AFTER \
                     @rid, Count WHERE ImageLoaded = ? AND Hashes = ?',
                     r[0].field('ImageLoaded'), r[0].field('Hashes') )

          // track ONLY Hashes        
            db.command('UPDATE ImageLoadedHashes set HashCount = HashCount + 1 \
                      UPSERT RETURN AFTER @rid, HashCount, BaseLined WHERE Hashes = ?', r[0].field('Hashes') )
            ConnectToProcessCreate(r[0]);
            break;

    case "UntrustedFile":
    case "UserActionTracking":
    case "SpoofParentProcessId":
    case "NetworkConnect":
    case "ProcessTerminate":
    case "DriverLoad":
    case "ProcessTampering":
    case "CapturedFile":
           this[classname](r[0])
           break;

    case "PipeCreated":	    	
    case "PipeConnected":   
    case "RawAccessRead":   
    case "FileCreateTime":  	
    case "FileCreate": 	     
    case "FileCreateStreamHash":     
    case "RegistryEvent":
            var wpc = CheckProcessWatchlist(e)
            if(wpc == null) return
            // otherwise connect the event to ProcessCreate in watchlist
            var sql = 'CREATE EDGE ' + edgeLookup(r[0].field('@class')) + ' FROM \
                          ' + wpc.field('PCrid') + ' TO ' + r[0].field('@rid')
            retry("db.command('" + sql + "')")
            retry("db.command('UPDATE "+ r[0].field('@rid') + " SET ToBeProcessed = false')")
            break;

    case "CreateRemoteThread":
    case "ProcessAccess":
           if(CheckProcessWatchlist(e) == null) return
           this[classname](r[0])    
           break;
    }

    return r
}
catch(err) {
  var msg = 'ProcessEvent: ' + err + ' | input: ' + jsondata + ' | ' + organisation
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "ProcessEvent", Message = ?', msg)
}

