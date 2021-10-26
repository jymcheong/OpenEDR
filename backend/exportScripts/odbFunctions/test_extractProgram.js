//@type
d

//parameters
null

//name
test_extractProgram

//language
javascript

//code
var db = orient.getDatabase();
var commands = db.query('select from clc where Score = 0')
print(commands.length)

for(var i = 0; i < commands.length ; i++) {
   //print(commands[i].field('CommandLine'))
   var firstParams = commands[i].field('CommandLine').split('.exe')[0]
   firstParams = firstParams.split('\\').reverse()[0].replace('"','').toLowerCase()
   if(firstParams.indexOf('.') > 0) firstParams = firstParams.replace(/[0-9]/g,'').replace(/[.]/g,'')
   firstParams = firstParams + '.exe'
   print(firstParams)
}

