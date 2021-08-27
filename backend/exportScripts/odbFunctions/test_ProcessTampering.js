//@type
d

//parameters
null

//name
test_ProcessTampering

//language
javascript

//code
var db = orient.getDatabase()

var pt = {"EventTime":"2021-04-05 12:10:09","Hostname":"DESKTOP-KTN8LG3","Keywords":-9223372036854775808,"EventType":"INFO","SeverityValue":2,"Severity":"INFO","EventID":25,"SourceName":"Microsoft-Windows-Sysmon","ProviderGuid":"{5770385F-C22A-43E0-BF4C-06F5698FFBD9}","Version":5,"Task":25,"OpcodeValue":0,"RecordNumber":113745,"ProcessID":11220,"ThreadID":4416,"Channel":"Microsoft-Windows-Sysmon/Operational","Domain":"NT AUTHORITY","AccountName":"SYSTEM","UserID":"S-1-5-18","AccountType":"User","Message":"Process Tampering:\r\nRuleName: -\r\nUtcTime: 2021-04-05 04:10:09.363\r\nProcessGuid: {6f9463f8-8da1-606a-852e-000000001800}\r\nProcessId: 13636\r\nImage: C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\r\nType: Image is replaced","Category":"Process Tampering (rule: ProcessTampering)","Opcode":"Info","RuleName":"-","UtcTime":"2021-04-05 04:10:09.363","ProcessGuid":"{6f9463f8-8da1-606a-852e-000000001800}","Image":"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe","Type":"Image is replaced","EventReceivedTime":"2021-04-05 12:11:16","SourceModuleName":"in","SourceModuleType":"im_msvistalog","DeviceVendor":"Microsoft","DeviceProduct":"EventLog"}

AddEvent( escape(JSON.stringify(pt)) )




