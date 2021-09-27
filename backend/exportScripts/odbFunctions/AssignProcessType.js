//@type
d

//parameters
e

//name
AssignProcessType

//language
javascript

//code
// called by Microsoft_Windows_Sysmon pre-processing function
// Updates timestamp id (every record has that field added within ProcessEvent) of first smss.exe & explorer.exe
// 1. any processes with id between these 2 timestamp are considered BeforeExplorer
// 2. any processes with id after explorer.exe are considered AfterExplorer
// 3. it also possible to have explorer.exe id < smss.exe id, this means user has yet to sign-in
// there's no return variable, parameter e is pass by reference, changes visible to caller
try{
  var db = orient.getDatabase();
  var t = db.query('select from ProcessType_id_cache Where Hostname = ? AND Organisation = ?', e.Hostname, e.Organisation)

  if(t.length > 0 && t[0].field('smss_id') > 0) {
      if(e.id > t[0].field('smss_id') && e.id > t[0].field('explorer_id')  
         && t[0].getProperty('explorer_id') > t[0].field('smss_id')) {
             e.ProcessType = "AfterExplorerBackground"
       }
       else {
             e.ProcessType = "BeforeExplorer"
       }
  }
  else { // this means the host has not rebooted after OpenEDR was installed
      print('Found orphan @ ' + e.Hostname + ' | ' + e.Image)
      e.ProcessType = "Orphan"
      e.ToBeProcessed = false
  }
}
catch(err){
  var msg = 'AssignProcessType: ' + err + ' | input: ' + JSON.stringify(e)
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "AssignProcessType", Message = ?', msg)
}

