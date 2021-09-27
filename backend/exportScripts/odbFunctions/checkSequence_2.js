//@type
d

//parameters
null

//name
checkSequence_2

//language
javascript

//code
var db = orient.getDatabase()
var suspected = db.query("select from processcreate where NOT Sequence like 'System%' AND NOT ProcessType = 'Orphan' limit 1000")
var msg = 'number of no sequence ' + suspected.length 
print(msg)
var withParent = 0
var woParent = 0
for(var i = 0; i < suspected.length; i++) {
	var parent = db.query("select from createdprocess4688 where PID = ? AND NewProcessName = ?", 
	suspected[i].field('ParentProcessId'), suspected[i].field('ParentImage') )
    if(parent.length > 0) withParent++
    else {
       parent = db.query("select from processcreate where Organisation = ? AND Hostname = ? AND ParentProcessGuid = ?", 
						  suspected[i].field('Organisation'), suspected[i].field('Hostname'), suspected[i].field('ParentProcessGuid') )
       if(parent.length == 0) print('checkSequence2 missing: ' + suspected[i].field('ParentImage') )
      else withParent++
    }
}
msg = 'With parents: ' + withParent + ' vs ' + woParent
print('\n' + msg + '\n')
return msg

