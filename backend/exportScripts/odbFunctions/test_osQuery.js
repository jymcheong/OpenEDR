//@type
d

//parameters
null

//name
test_osQuery

//language
javascript

//code
var db = orient.getDatabase()
var s = 'System > smss.exe > smss.exe > wininit.exe > services.exe > svchost.exe > wuauclt.exe > AM_Delta_Patch_1.321.2229.1.exe'
s = stripDottedNumbers(s)
var r = db.query('select from seq where BaseLined = true AND Sequence = ?',s)

return r.length

var d = '{"SourceName":"OSQuery","Organisation":"MyCo","Hostname":"WWWPC1","RequestRequestRid":"#23:23", "QueryStart":"2020-03-03T18:00:00.123Z","QueryEnd":"2020-03-03T18:00:03.456Z", "Query":"select * from drivers", "Results":[{"Blah":1},{"Blah":2}]}'

var e = JSON.parse(d)

if(e['SourceName'].toLowerCase() == 'osquery') {
	var re = /FROM\s+(.+)\s*/gi
	var match = re.exec(e['Query'])
    if(match.length < 2) return
  	classname = "OSQuery_" + match[1];  
    for(var i = 0; i < e['Results'].length ; i++) {
        var eachline = e['Results'][i]
        eachline['Organisation'] = e['Organisation']
        eachline['Hostname'] = e['Hostname']
        eachline['QueryStart'] = e['QueryStart']
        eachline['QueryEnd'] = e['QueryEnd']
        eachline['RequestRequestRid'] = e['RequestRequestRid']
        var stmt = 'INSERT INTO '+ classname + ' CONTENT ' + JSON.stringify(eachline)
        print(stmt);
        db.command(stmt)    
    }
    return
}

