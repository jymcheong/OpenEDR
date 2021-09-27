//@type
d

//parameters
e

//name
DataFusionProcMon

//language
javascript

//code
// pre-processing routine called by ProcessEvent
e._classname = e.Class; 
if(e._classname == 'SpoofParentProcessId') print('Spoof found: ' + e.ProcessGuid)
delete e.Class;
return e

