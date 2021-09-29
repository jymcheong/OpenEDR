//@type
d

//parameters
null

//name
test_ProcessCreate

//language
javascript

//code
var db = orient.getDatabase()

var pc = {"EventTime":"2021-04-05 12:10:09","Hostname":"DESKTOP-KTN8LG3","Keywords":-9223372036854775808,"EventType":"INFO","SeverityValue":2,"Severity":"INFO","EventID":1,"SourceName":"Microsoft-Windows-Sysmon","ProviderGuid":"{5770385F-C22A-43E0-BF4C-06F5698FFBD9}","Version":5,"Task":1,"OpcodeValue":0,"RecordNumber":113744,"ProcessID":11220,"ThreadID":4416,"Channel":"Microsoft-Windows-Sysmon/Operational","Domain":"NT AUTHORITY","AccountName":"SYSTEM","UserID":"S-1-5-18","AccountType":"User","Message":"Process Create:\r\nRuleName: -\r\nUtcTime: 2021-04-05 04:10:09.353\r\nProcessGuid: {6f9463f8-8da1-606a-852e-000000001800}\r\nProcessId: 13636\r\nImage: C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\r\nFileVersion: 89.0.774.68\r\nDescription: Microsoft Edge\r\nProduct: Microsoft Edge\r\nCompany: Microsoft Corporation\r\nOriginalFileName: msedge.exe\r\nCommandLine: \"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\" --type=renderer --field-trial-handle=1956,13556612160138863865,13153239581568388022,131072 --lang=en-US --disable-client-side-phishing-detection --device-scale-factor=1 --num-raster-threads=4 --enable-main-frame-before-activation --renderer-client-id=9 --no-v8-untrusted-code-mitigations --mojo-platform-channel-handle=164 /prefetch:1\r\nCurrentDirectory: C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\89.0.774.68\\\r\nUser: DESKTOP-KTN8LG3\\q\r\nLogonGuid: {6f9463f8-6084-6065-d4d2-1b0000000000}\r\nLogonId: 0x1BD2D4\r\nTerminalSessionId: 2\r\nIntegrityLevel: Low\r\nHashes: MD5=FC449610FB8823F74414DF453B0E636E,SHA256=A9E592770FA1A63126ADA4F3B2F35FAE5EBF38D40A8178E412D5DF187D4D6162,IMPHASH=AA958B231113F22EC7CBE355F040ECED\r\nParentProcessGuid: {6f9463f8-8d7f-606a-4f2e-000000001800}\r\nParentProcessId: 7436\r\nParentImage: C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\r\nParentCommandLine: \"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\" --profile-directory=Default","Category":"Process Create (rule: ProcessCreate)","Opcode":"Info","RuleName":"-","UtcTime":"2021-04-05 04:10:09.353","ProcessGuid":"{6f9463f8-8da1-606a-852e-000000001800}","Image":"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe","FileVersion":"89.0.774.68","Description":"Microsoft Edge","Product":"Microsoft Edge","Company":"Microsoft Corporation","OriginalFileName":"msedge.exe","CommandLine":"\"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\" --type=renderer --field-trial-handle=1956,13556612160138863865,13153239581568388022,131072 --lang=en-US --disable-client-side-phishing-detection --device-scale-factor=1 --num-raster-threads=4 --enable-main-frame-before-activation --renderer-client-id=9 --no-v8-untrusted-code-mitigations --mojo-platform-channel-handle=164 /prefetch:1","CurrentDirectory":"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\89.0.774.68\\","User":"DESKTOP-KTN8LG3\\q","LogonGuid":"{6f9463f8-6084-6065-d4d2-1b0000000000}","LogonId":"0x1bd2d4","TerminalSessionId":"2","IntegrityLevel":"Low","Hashes":"MD5=FC449610FB8823F74414DF453B0E636E,SHA256=A9E592770FA1A63126ADA4F3B2F35FAE5EBF38D40A8178E412D5DF187D4D6162,IMPHASH=AA958B231113F22EC7CBE355F040ECED","ParentProcessGuid":"{6f9463f8-8d7f-606a-4f2e-000000001800}","ParentProcessId":"7436","ParentImage":"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe","ParentCommandLine":"\"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\" --profile-directory=Default","EventReceivedTime":"2021-04-05 12:11:16","SourceModuleName":"in","SourceModuleType":"im_msvistalog","DeviceVendor":"Microsoft","DeviceProduct":"EventLog"}


AddEvent( escape(JSON.stringify(pc)) )

// it is expected to see from ODB console: ProcessEvent found parent process with ParentProcessGuid but sequence is null 
 

