//@type
d

//parameters
rid

//name
GetCaseProcessSequence

//language
javascript

//code
//Used by investigation board controller
try{
    var db = orient.getDatabase();
    var r = db.command("select from (traverse in('AddedTo'), in('FollowedBy'), in('LastForeground') from "+rid
                       + " MAXDEPTH 3) where @rid <> ? AND @class <> 'Case' order by id", rid); 
    return r
}
catch(err){
  var msg = 'GetCaseProcessSequence: ' + err + ' | input: ' + rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "GetCaseProcessSequence", Message = ?', msg)
}

