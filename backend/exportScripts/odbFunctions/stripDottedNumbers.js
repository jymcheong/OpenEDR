//@type
d

//parameters
sequence

//name
stripDottedNumbers

//language
javascript

//code
// eg: System > smss.exe > smss.exe > wininit.exe > services.exe > svchost.exe > wuauclt.exe > AM_Delta_Patch_1.321.2229.1.exe
// note the frontend whitelisting need to use this function otherwise matching won't work

var exenames = sequence.split(" > ")
lastone = exenames[exenames.length - 1]
lastone = lastone.replace('.exe','').replace(/[0-9]/g,'').replace(/[.]/g,'')
var newseq = ''
// names like blahX64.exe will get affected too
for(var i = 0; i < exenames.length - 1; i++) 
  newseq = newseq + (exenames[i].replace('.exe','').replace(/[0-9]/g,'').replace(/[.]/g,'') + ' > ')

return newseq + lastone





