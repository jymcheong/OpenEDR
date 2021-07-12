//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
rid

//name
WhitelistDriverLoad

//language
javascript

//code
// rid: string of a DriverLoad
// use traverse in('SysSighted') from <RID>
// Called from frontend.js

var db = orient.getDatabase();

var r = db.query("traverse in('SysSighted') from " + rid);
//print('whitelisting driver')
for(var i = 0; i < r.length; i++) {
	if(r[i].field('@class') == 'ImageLoadedHashes') {
        //print(r[i].field('@rid'))
        db.command('update ? set BaseLined = true', r[i].field('@rid'));
    }
}
 

