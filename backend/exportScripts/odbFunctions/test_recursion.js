//@type
d

//parameters
null

//name
test_recursion

//language
javascript

//code
var db = orient.getDatabase()

var p = db.query('select from processcreate where NOT Sequence like "System%" AND NOT ProcessType = "Orphan" order by id desc')

print('\n\n========start=========')
function findParent(pc) {
   var parentSeq = ''
   if(pc.field('@class') == 'ProcessCreate') {
       // when we reach a process having sequence, we return from recursion
       var seq = db.query('SELECT FROM LineageLookup where Organisation = ? AND Hostname = ? AND PID = ? AND Image = ?',
                           pc.field('Organisation'), pc.field('Hostname'), pc.field('ProcessId'), pc.field('Image') )
       if(seq.length > 0) return seq[0].field('Sequence')
     
       var parent = db.query('SELECT from ProcessCreate where Organisation = ? AND Hostname = ? AND ProcessGuid = ?',
                             pc.field('Organisation'), pc.field('Hostname'), pc.field('ParentProcessGuid'))
       if(parent.length > 0) {
          //print('\nProcessCreate Parent: ' + parent[0].field('Image'))
          parentSeq = findParent(parent[0])
          if(parent[0].field('Sequence')) return (parent[0].field('Sequence') + ' > ' + pc.field('Image').split('\\').reverse()[0])
          if(parentSeq.indexOf('System') == 0) return (parentSeq + ' > ' + pc.field('Image').split('\\').reverse()[0])
          else return parentSeq
       }
       parent = db.query('SELECT from CreatedProcess4688 where Organisation = ? AND Hostname = ? AND PID = ? AND NewProcessName = ?',
                          pc.field('Organisation'), pc.field('Hostname'), pc.field('ParentProcessId'), pc.field('ParentImage') )
       if(parent.length > 0) {
          //print('\nfound 4688 parent: ' + parent[0].field('NewProcessName'))
          parentSeq = findParent(parent[0])
          if(parentSeq.indexOf('System') == 0) return (parentSeq + ' > ' + pc.field('Image').split('\\').reverse()[0])
          else return parentSeq
       }
       print('Tried both ProcessCreate & 4688 - No parent for ' + pc.field('Image') + ' parent: ' + pc.field('ParentImage'))
   }
   else{ // using 4688 audit events
     if(!pc.field('CreatorProcessName') && pc.field('NewProcessName').indexOf('smss.exe') > 0) return 'System > smss.exe'
      var seq = db.query('SELECT FROM LineageLookup where Organisation = ? AND Hostname = ? AND PID = ? AND Image = ?',
                           pc.field('Organisation'), pc.field('Hostname'), pc.field('PID'), pc.field('ProcessName') )
      if(seq.length > 0) return seq[0].field('Sequence')
      
      parent = db.query('SELECT from CreatedProcess4688 where Organisation = ? AND Hostname = ? AND PID = ? AND NewProcessName = ?',
                          pc.field('Organisation'), pc.field('Hostname'), pc.field('PPID'), pc.field('ParentProcessName') )

     // WILL LOOP if we try searching ProcessCreate parent again! 
      if(parent.length > 0) {
          //print('\n4688 Parent: ' + parent[0].field('NewProcessName'))
          parentSeq = findParent(parent[0])
      }   
      if(parentSeq.indexOf('System') == 0) return (parentSeq + ' > ' + pc.field('NewProcessName').split('\\').reverse()[0])
      else return parentSeq
     
      print('4688 path - No parent for ' + pc.field('NewProcessName') + ' parent: ' + pc.field('CreatorProcessName'))
   }
   return ""
}
var total = 0
for(var i = 0; i < p.length; i++) {
  var s = findParent(p[i])
  //print('Seq: ' + s + '\n')
  if(s.length > 0) total++ 
  else {
     print('Missing for: ' + p[i].field('Image') + ' | parent: ' + p[i].field('ParentImage'))
     print('Orphan RID: ' + p[i].field('@rid'))
     print('========================')
  }
}
print('Total with sequence: ' + total)

