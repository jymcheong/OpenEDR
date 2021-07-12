//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
e

//name
UpdateProcessTypeLookup

//language
javascript

//code
var db = orient.getDatabase();

if(e['ParentImage'] == "System") { 
	print(''); print(Date() + " Found " + e['Image'] + " on " + e['Hostname']); print('');
    db.command('UPDATE ProcessType_id_cache SET smss_id = ? UPSERT WHERE Hostname = ? AND \
						Organisation = ?',e['id'],e['Hostname'],e['Organisation'])
}

// update explorer.exe ID into cache table to find Type A (BeforeExplorer) process      
if(e['ParentImage'].indexOf("Windows\\System32\\userinit.exe") > 0 && e['Image'].indexOf('explorer.exe') > 0){
	print('')
    print(Date() + " Found " + e['Image'] + " on " + e['Hostname'])
    print('')
	db.command('UPDATE ProcessType_id_cache SET explorer_id = ? UPSERT WHERE Hostname = ? AND \
                       Organisation = ?',e['id'],e['Hostname'],e['Organisation'])
}

