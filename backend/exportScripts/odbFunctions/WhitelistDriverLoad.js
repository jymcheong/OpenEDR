//@type
d

//parameters
rid

//name
WhitelistDriverLoad

//language
javascript

//code
// rid: string of a DriverLoad
// use traverse in('SysSighted') from <RID>
// Called from frontend.js
try{
  
    var db = orient.getDatabase();

    var r = db.query("traverse in('SysSighted') from " + rid);
    //print('whitelisting driver')
    for(var i = 0; i < r.length; i++) {
        if(r[i].field('@class') == 'ImageLoadedHashes') {
            //print(r[i].field('@rid'))
            db.command('update ? set BaseLined = true', r[i].field('@rid'));
        }
    }

}
catch(err){
  var msg = 'WhitelistDriverLoad: ' + err + ' | input: ' + rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "WhitelistDriverLoad", Message = ?', msg)
}

