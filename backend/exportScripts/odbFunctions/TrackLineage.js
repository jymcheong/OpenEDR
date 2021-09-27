//@type
d

//parameters
seq,rid,r

//name
TrackLineage

//language
javascript

//code
/*
	seq is Lineage sequence: System > .... > explorer.exe
    rid is @rid of a ProcessCreate
    r is inserted ProcessCreate record
*/
try{
    var db = orient.getDatabase();
    if(seq.length == 0) return
    var sc = db.command('UPDATE seq SET Count = Count + 1 UPSERT RETURN AFTER @rid, Count, Score WHERE Sequence = ?',seq) 
    var toLink = false
    if(sc[0].field('Score') > 0) toLink = true
    if(sc[0].field('Count') == 1) {
      var wl = db.query('select from seq WHERE BaseLined = true AND Sequence = ?', stripDottedNumbers(seq))
      if(wl.length == 0) toLink = true // not whitelisted
    }
    if(toLink) {
      sql = 'CREATE EDGE SequenceSighted FROM '+sc[0].field('@rid')+' TO '+ rid
      retry("db.command('" + sql + "')")
    }
    if(seq.indexOf('winlogon.exe') > 0 || seq.indexOf('wininit.exe') > 0)
     print(r.field('EventTime') + '\n' +  r.field('Organisation') + ' | ' + r.field('Hostname') + ' : ' + seq.replace('System > smss.exe > smss.exe > ','... ') + ' | ' + sc[0].field('Count') + ' | ' + rid);     
   else 
     print(r.field('EventTime') + '\n' +  r.field('Organisation') + ' | ' + r.field('Hostname') + ' : ' + seq + ' | ' + sc[0].field('Count') + ' | ' + rid);     

}
catch(err){
  var msg = 'TrackLineage: ' + err + ' | input: ' + seq + ' , ' + rid 
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "TrackLineage", Message = ?', msg)
}

