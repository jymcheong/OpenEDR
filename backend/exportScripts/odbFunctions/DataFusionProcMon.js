//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
e

//name
DataFusionProcMon

//language
javascript

//code
// pre-processing routine called by AddEvent
e['_classname'] = e['Class']; 
if(e['_classname'] == 'SpoofParentProcessId') print('Spoof found: ' + e['ProcessGuid'])
delete e['Class'];
return e

