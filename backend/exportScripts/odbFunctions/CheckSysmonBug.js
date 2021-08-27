//@type
d

//parameters
e

//name
CheckSysmonBug

//language
javascript

//code
// fix Sysmon bug: wrong ParentImage, ParentProcessGuid, ParentCommandLine
// this bug results to circular ParentOf references
try{
    var db = orient.getDatabase();

    if(e.ParentImage.indexOf('svchost.exe') > 0 && (e.Image.indexOf('wininit.exe') > 0 || e.Image.indexOf('csrss.exe') > 0)) {
        print('')
        print('Sysmon bug found! ' + e.Image)
        print('')         
        var parent = db.query("select from pc Where ParentImage like '%smss.exe' AND \
                                    Image like '%smss.exe' AND ProcessId = ? AND Hostname = ? AND \
                                    Organisation = ? order by id desc \
                                    limit 1", e.ParentProcessId, e.Hostname, e.Organisation)
        if(parent.length == 0) return 
        print('Found CORRECT parent process')
        e.ParentImage = parent[0].field('Image')
        e.ParentCommandLine = parent[0].field('CommandLine')
        e.ParentProcessGuid = parent[0].field('ProcessGuid')
    }
}
catch(err){
  var msg = 'CheckSysmonBug: ' + err + ' | input: ' + JSON.stringify(e)
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "CheckSysmonBug", Message = ?', msg)
}

