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
AssignProcessType

//language
javascript

//code
// called by Microsoft_Windows_Sysmon pre-processing function
var db = orient.getDatabase();

var t = db.query('select from ProcessType_id_cache Where Hostname = ? AND Organisation = ?', 
				 e['Hostname'], e['Organisation'])
if(t.length > 0 && t[0].field('smss_id') > 0) {
	if(e['id'] > t[0].field('smss_id') && e['id'] > t[0].field('explorer_id')  
       && t[0].getProperty('explorer_id') > t[0].field('smss_id')) {
           e['ProcessType'] = "AfterExplorerBackground"
     }
	 else {
           e['ProcessType'] = "BeforeExplorer"
	 }

}
else {
	print('Found orphan @ ' + e['Hostname'] + ' | ' + e['Image'])
	e['ProcessType'] = "Orphan"
  	e['ToBeProcessed'] = false
}

