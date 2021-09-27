//@type
d

//parameters
null

//name
test_CapturedFile

//language
javascript

//code
var db = orient.getDatabase()

var cf = {"Class":"CapturedFile","ProcessGuid":"{6F9463F8-8DA1-606A-852E-000000001800}","OriginalPath":"c:\\users\\q\\desktop\\21dbgview - copy - copy.exe","UploadedFileName":"sample_F7F649EFE114DB7E4EDD93BD11171AAD7072C4006F36EA4D7BC683A541DB9781.ex_","SourceName":"DataFusionProcMon","Hostname":"DESKTOP-KTN8LG3"}

// Upload.exe will do this before transmitting...
var cfEscaped = escape(JSON.stringify(cf))
print(cfEscaped)

// Simulating a upload instead of just direct INSERT
ProcessEvent(cfEscaped)

return 1


