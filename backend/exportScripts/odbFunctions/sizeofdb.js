//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
null

//name
sizeofdb

//language
javascript

//code
var db = orient.getDatabase();
var size = db.getSize()
print(size)

