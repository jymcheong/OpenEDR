//@type
d

//parameters
r

//name
CapturedFile

//language
javascript

//code
var db = orient.getDatabase();

print()
print(Date() + "||" + r.field('@rid') + " CapturedFile " + r.field('ProcessGuid') + ' OriginalPath: ' + r.field('OriginalPath'))
print()

var pc = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? AND ProcessGuid = ? limit 1', r.field('Organisation'), r.field('Hostname'),  r.field('ProcessGuid'));

if(pc.length == 0) return

retry("db.command('CREATE EDGE WrittenFileSighted FROM " + pc[0].field('@rid') + " to " + r.field('@rid') + "')")
print('linked CapturedFile ' + r.field('@rid') + ' to ' + pc[0].field('@rid'))

