//@type
d

//parameters
e

//name
UpdateProcessTypeLookup

//language
javascript

//code
try{
    var db = orient.getDatabase();

    // the first smss.exe is the only ProcessCreate record that has ParentImage = System
    if(e.ParentImage == "System") { 
        print(''); print(Date() + " Found " + e.Image + " on " + e.Hostname); print('');
        db.command('UPDATE ProcessType_id_cache SET smss_id = ? UPSERT WHERE Hostname = ? AND \
                            Organisation = ?',e.id, e.Hostname, e.Organisation)
    }

    // update explorer.exe ID into cache table to find BeforeExplorer process      
    if(e.ParentImage.indexOf("Windows\\System32\\userinit.exe") > 0 && e.Image.indexOf('explorer.exe') > 0){
        print('')
        print(Date() + " Found " + e.Image + " on " + e.Hostname)
        print('')
        db.command('UPDATE ProcessType_id_cache SET explorer_id = ? UPSERT WHERE Hostname = ? AND \
                           Organisation = ?', e.id, e.Hostname, e.Organisation)
    }
}
catch(err){
  var msg = 'UpdateProcessTypeLookup: ' + err + ' | input: ' + JSON.stringify(e)
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "UpdateProcessTypeLookup", Message = ?', msg)
}

