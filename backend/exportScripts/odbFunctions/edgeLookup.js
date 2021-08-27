//@type
d

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
else return "ProcessGuid"; // this is a catch all edge class

