//@type
d

//parameters
rid

//name
WhitelistSequence

//language
javascript

//code
// rid: RID of a ProcessCreate
// use traverse in('sequencesighted') from <RID>
// Called from frontend.js
try{
  
    var db = orient.getDatabase();

    var r = db.query("traverse in('sequencesighted') from " + rid);
    for(var i = 0; i < r.length; i++) {
        if(r[i].field('@class') == 'ParentOfSequence') {
            db.command('update ? set Score = 0', r[i].field('@rid'));
            db.command('insert into seq set BaseLined = true, Count = 1, Score = 0, Sequence = ?',
                       stripDottedNumbers(r[i].field('Sequence')))
        }
    }

}
catch(err){
  var msg = 'WhitelistSequence: ' + err + ' | input: ' + rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "WhitelistSequence", Message = ?', msg)
}

