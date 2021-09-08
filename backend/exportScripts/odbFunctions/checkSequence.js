//@type
d

//parameters
null

//name
checkSequence

//language
javascript

//code
var db = orient.getDatabase()
var suspected = db.query('select from seq where Count < 5 AND BaseLined = false')
print(suspected.length)
for(var i=0; i < suspected.length; i++) {
  //print( suspected[i].field('Sequence') )
  var PCs = db.query('select from processcreate where Sequence = ?',suspected[i].field('Sequence'))
  for(var n=0; n < PCs.length; n++){
    var ParentImage = PCs[n].field('ParentImage').split('\\').reverse()[0]
    if(suspected[i].field('Sequence').indexOf(ParentImage) < 0)
      print(PCs[n].field('EventTime') + '|'+ suspected[i].field('Sequence'))
  }
}

