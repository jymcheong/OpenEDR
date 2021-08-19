//@type
d

//parameters
null

//name
findOO

//language
javascript

//code
// to find Out-of-order ProcessCreate

var db = orient.getDatabase();
var r = db.query("SELECT id FROM pc where ParentImage = 'System' order by id desc limit 1")
if(r.length == 0) return

var prev_RN = 0
var PCs = db.query("SELECT RecordNumber FROM pc where id > ? order by id asc limit 100", r[0].field('id') )
if(PCs.length == 0) return

for(var i = 0; i < PCs.length; i++) {
	if(PCs[i].field('RecordNumber') > prev_RN) {
    	prev_RN = PCs[i].field('RecordNumber')
    }
    else {
    	print('Found out of order: ' + prev_RN)
        return prev_RN
        break;
    }
}

return "none found"

