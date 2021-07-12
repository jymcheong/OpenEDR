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
GetCaseProcessSequence

//language
javascript

//code
//Used by investigation board controller

var db = orient.getDatabase();
var r = db.command("select from (traverse in('AddedTo'), in('FollowedBy'), in('LastForeground') from "+rid
                   + " MAXDEPTH 3) where @rid <> ? AND @class <> 'Case' order by id", rid); 
return r


