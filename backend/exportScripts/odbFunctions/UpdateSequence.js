//@type
d

//parameters
null

//name
UpdateSequence

//language
javascript

//code
/*
	NO longer in use, kept for reference
	This is a Dynamic Hook function. Using console:
    alter class parentof Superclass +OTriggered
    alter class parentof CUSTOM onAfterCreate='UpdateSequence'
    This function is called whenever ParentOf edge is linked between a Parent & Child Process.
    This function will upsert the lineage sequence class (named Sequence) to track new process lineage
*/
return
var db = orient.getDatabase();

function fixSequence(prevSeq){
	print('Found partial sequence, attempt to fix: ' + prevSeq + ' from ' + doc.field('in').field('@rid'))
    for(var i = 0; i < 3; i++) {
      var ps = db.query('SELECT GetParentOfSequence(?) as seq', doc.field('out').field('@rid'))
      prevSeq = ps[0].field('seq')
      if(prevSeq == null || prevSeq.indexOf('System >') < 0) continue;
      //found valid sequence
      db.command('UPDATE ? SET Sequence = ? RETURN AFTER Sequence', doc.field('out').field('@rid'), prevSeq)
      print('GetParentOfSequence found: ' + prevSeq + ' for ' + doc.field('in').field('@rid'))	
      return prevSeq
    }
    var parentEXE = doc.field('out').field('Image').split('\\').reverse()[0];
    var childEXE = doc.field('in').field('Image').split('\\').reverse()[0];
    var partialSeq = parentEXE + ' > ' + childEXE
    //print(partialSeq)
    var seq = db.query('SELECT Sequence from seq WHERE Sequence like "%' + partialSeq + '"')
    if(seq.length > 0) return seq[0].field('Sequence').replace(' > ' + childEXE, "")
    return parentEXE
}

function upsertSequence(seq, rid){
    if(seq.length == 0) return
  
    var sc = db.command('UPDATE seq SET Count = Count + 1 UPSERT \
				RETURN AFTER @rid, Count, Score WHERE Sequence = ?',seq) 
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
    //print(doc.field('in').field('EventTime') + '\n' +  doc.field('in').field('Organisation') + ' | ' + doc.field('in').field('Hostname') + ' : ' + seq + '|' + sc[0].field('Count'));
}

// Sometimes Sequence may not be assigned at Microsoft_Windows_Sysmon pre-processing function
if(doc.field('in').field('Sequence') === null) {
//  print('no pre-processed Sequence!')
  var exename = doc.field('in').field('Image').split("\\")
  exename = exename[exename.length - 1]
  var prevSeq = '' + doc.field('out').field('Sequence'); 
  for(var i = 0; i < 3; i++){ //retry mechanism
    try{
       //valid sequence always starts with 'System >' 
       if(prevSeq.indexOf('System > ') == 0) { 
          var seq = prevSeq + ' > ' + exename
          var sql = 'UPDATE ' + doc.field('in').field('@rid') + ' SET \
                    Sequence = "'+seq+'" RETURN AFTER Sequence'
          retry("db.command('" + sql + "')")
          upsertSequence(seq, doc.field('in').field('@rid'))    
          break;
        }
        //prevSeq = fixSequence(prevSeq)
    }
    catch(err){
      if(err.indexOf('UPDATE') >= 0) continue; 
    }
  }
  // update ProcessType if unable to recover any Sequence
  if(prevSeq == null || prevSeq.indexOf('System >') < 0){
    var sql = 'UPDATE ' + doc.field('in').field('@rid') + ' SET ProcessType = "Orphan"'
    retry("db.command('" + sql + "')")
  }
}
else upsertSequence(doc.field('in').field('Sequence'),doc.field('in').field('@rid'))

