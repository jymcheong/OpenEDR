//@type
d

//parameters
u

//name
UserActionTracking

//language
javascript

//code
try{

    var db = orient.getDatabase();
    var rid = u.field('@rid')

    // keeping this because of the parameterized SQL
    function retry(command){
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
    }
    var pc = null
    var ua = '' + u
    if(ua.indexOf('Foreground Transition') > 0) {
      print('\nForeground transit from: ')
      print(u.getProperty('@rid') + ' ' + u.getProperty('FromProcessId') + ' to ' + u.getProperty('ToProcessId') + '\n'); 

      if(u.getProperty('FromProcessGuid') == null) {
        retry("db.command('CREATE EDGE SwitchedFrom FROM (SELECT FROM ProcessCreate WHERE Organisation = ? \
             AND Hostname = ? AND ProcessId = ? Order By id Desc Limit 1) TO ?', \
    u.getProperty('Organisation'),u.getProperty('Hostname'),u.getProperty('FromProcessId'),u.getProperty('@rid'))")
      }
      else {
         retry("db.command('CREATE EDGE SwitchedFrom FROM (SELECT FROM ProcessCreate WHERE Organisation = ? \
             AND Hostname = ? AND ProcessGuid = ? Order By id Desc Limit 1) TO ?', \
    u.getProperty('Organisation'),u.getProperty('Hostname'),u.getProperty('FromProcessGuid'),u.getProperty('@rid'))")
      }

      if(u.getProperty('ToProcessGuid') == null) {
        retry("db.command('CREATE EDGE SwitchedTo FROM ? TO (SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? AND ProcessId = ? Order By id Desc  LIMIT 1)', \
    u.getProperty('@rid'),u.getProperty('Organisation'),u.getProperty('Hostname'),u.getProperty('ToProcessId'))")

        pc = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? AND ProcessId = ? Order By id Desc LIMIT 1', u.getProperty('Organisation'),u.getProperty('Hostname'),u.getProperty('ToProcessId'))
      }
      else {
        retry("db.command('CREATE EDGE SwitchedTo FROM ? TO (SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? AND ProcessGuid = ? Order By id Desc  LIMIT 1)', \
    u.getProperty('@rid'),u.getProperty('Organisation'),u.getProperty('Hostname'),u.getProperty('ToProcessGuid'))")

        pc = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? AND ProcessGuid = ? Order By id Desc LIMIT 1', u.getProperty('Organisation'),u.getProperty('Hostname'),u.getProperty('ToProcessGuid'))
      }

    //means somehow ProcessCreate was missing, eg. DataFusion was installed after the Process was created
      if(pc.length == 0) { 
          print("ProcessCreate not available for " + u.getProperty('@rid'));
          return 
      }
    //  print(pc[0].getProperty('ProcessType'));
    }
    else { // Click, MouseMove, Enter...
      if(u.getProperty('ProcessGuid')==null) {
        pc = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? \
        AND ProcessId = ? Order By id Desc LIMIT 1', u.getProperty('Organisation'),u.getProperty('Hostname'),u.getProperty('ProcessId'))
      }
      else {
        pc = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? \
        AND ProcessGuid = ? Order By id Desc LIMIT 1', u.getProperty('Organisation'),u.getProperty('Hostname'),u.getProperty('ProcessGuid'))
      }

       //means somehow ProcessCreate was missing, eg. DataFusion was installed after the Process was created
        if(pc.length == 0) return 

        retry("db.command('CREATE EDGE ActedOn FROM ? TO ?',u.getProperty('@rid'),pc[0].getProperty('@rid'))")
    }

    if(pc[0].getProperty('ProcessType') != 'AfterExplorerForeground'){
      print('1. Assigning to AfterExplorerForeground for ' + pc[0].getProperty('@rid') + '\n' + pc[0].getProperty('Organisation') + ':' + pc[0].getProperty('Hostname') + ':' + pc[0].getProperty('Image') + '\n');
      retry("db.command('UPDATE ? SET ProcessType = ?', pc[0].getProperty('@rid'),'AfterExplorerForeground')")      
    }

    retry("db.command('UPDATE " + rid + " SET ToBeProcessed = false')") 

}
catch(err){
  var msg = 'UserActionTracking: ' + err + ' | input: ' + rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "UserActionTracking", Message = ?', msg)
}




