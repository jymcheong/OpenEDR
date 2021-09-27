//@type
d

//parameters
e

//name
OSQuery

//language
javascript

//code
try{
    // pre-processing routine called by ProcessEvent
    var db = orient.getDatabase();
    // handle OSQuery results
    var re = /FROM\s+(.+)\s*/gi
    var match = re.exec(e['Query'])
    if(match.length < 2) return 0
    var _classname = "OSQuery_" + match[1];  
    for(var i = 0; i < e['Results'].length ; i++) {
        var eachline = e['Results'][i]
        eachline['Organisation'] = e['Organisation']
        eachline['Hostname'] = e['Hostname']
        eachline['QueryStart'] = e['QueryStart']
        eachline['QueryEnd'] = e['QueryEnd']
        eachline['RequestRequestRid'] = e['RequestRequestRid']
        var stmt = 'INSERT INTO '+ _classname + ' CONTENT ' + JSON.stringify(eachline)
        print(stmt);
        try { r = db.command(stmt); }
        catch(err){
           print(Date() + ' Error inserting: ' + err)
           db.command('INSERT INTO Errors SET OffendingStatement = ?, Error = ?', stmt, err)
        }
    }
    return 0

}
catch(err){
  var msg = 'OSQuery: ' + err + ' | input: ' + JSON.stringify(e)
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "OSQuery", Message = ?', msg)
}

