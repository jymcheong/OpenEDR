//@type
d

//parameters
id

//name
eventIdLookup

//language
javascript

//code
// EventId to Sysmon Sub-Classname 
var _eventIdLookup = {1:'ProcessCreate', 2:'FileCreateTime', 3:'NetworkConnect', 
                    4:'SysmonStatus', 5:'ProcessTerminate',6:'DriverLoad', 
                    7:'ImageLoad', 8:'CreateRemoteThread', 9:'RawAccessRead', 
                    10:'ProcessAccess', 11:'FileCreate', 12:'RegistryEvent', 
                    13:'RegistryEvent', 14:'RegistryEvent', 15:'FileCreateStreamHash', 
                    16:'ConfigChanged', 17:'PipeCreated', 18:'PipeConnected', 
                    19:'WmiEvent', 20:'WmiEvent', 21:'WmiEvent', 22:'DnsQuery', 23:'FileDelete', 
                    25:'ProcessTampering', 255:'Error' }

if(id in _eventIdLookup){
	return _eventIdLookup[id]
}
else
    return "Sysmon" 
// when in doubt, throw it to Sysmon class

