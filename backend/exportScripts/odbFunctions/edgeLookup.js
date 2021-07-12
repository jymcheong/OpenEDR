//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
classname

//name
edgeLookup

//language
javascript

//code
var _edgeLookup = {'ProcessTerminate':'Terminated', 'PipeCreated':'CreatedPipe',
                'PipeConnected':'ConnectedPipe', 'RawAccessRead':'RawRead',
                'FileCreateTime':'ChangedFileCreateTime', 'FileCreate':'CreatedFile',
                'FileCreateStreamHash':'CreatedFileStream', 'RegistryEvent':'AccessedRegistry',
                'NetworkConnect':'ConnectedTo', 'ImageLoad':'LoadedImage', 'ProcessTampering':'Tampered'}
if(classname in _edgeLookup){
	return _edgeLookup[classname];
}
else return "ProcessGuid";

