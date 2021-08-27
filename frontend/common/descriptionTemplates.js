const event = {}

//Captured File 
event['CapturedFile'] = `

### <font color="#AAAAAA" size=2>Original Path</font>
{{event.OriginalPath}}

### <font color="#AAAAAA" size=2>Uploaded Filename</font>
{{event.UploadedFileName}}


{{if(options.event.IntezerTotalGeneCount != undefined)}}### <font color="#AAAAAA" size=2>Intezer Analysis Results</font>{{/if}}

{{if(options.event.IntezerVerdict != undefined)}}### <font color="#AAAAAA" size=2>Verdict</font>: {{event.IntezerVerdict}}{{/if}}

{{if(options.event.IntezerTotalGeneCount != undefined)}}### <font color="#AAAAAA" size=2>Total Gene-Count</font>: {{event.IntezerTotalGeneCount}}{{/if}}

{{if(options.event.IntezerTotalUniqueGeneCount != undefined)}}### <font color="#AAAAAA" size=2>Total Unique Gene-Count</font>: {{event.IntezerTotalUniqueGeneCount}}{{/if}}

{{if(options.event.IntezerTotalCommonGeneCount != undefined)}}### <font color="#AAAAAA" size=2>Total Common Gene-Count</font>: {{event.IntezerTotalCommonGeneCount}}{{/if}}

`

//SYSMON Event ID 25
event['ProcessTampering'] = `

### <font color="#AAAAAA" size=2>Image</font>
{{event.Image}}

`

//SYSMON EVENT ID 1 
event['ProcessCreate'] = `
### <font color="#AAAAAA" size=2>{{event.ProcessType}} Image - Pid {{event.ProcessId}} - {{event.IntegrityLevel}} IntegrityLevel</font>
{{event.Image}}

### <font color="#AAAAAA" size=2>Sequence</font>
{{if(options.event.Sequence != undefined)}}{{event.Sequence}}{{#else}}pending...{{/if}}

### <font color="#AAAAAA" size=2>CommandLine</font>
{{event.CommandLine}}

### <font color="#AAAAAA" size=2>CurrentDirectory</font>
{{event.CurrentDirectory}}

### <font color="#AAAAAA" size=2>Hashes</font>
{{event.Hashes}}

### <font color="#AAAAAA" size=2>ParentImage - Pid {{event.ParentProcessId}}</font>
{{event.ParentImage}}

### <font color="#AAAAAA" size=2>ParentCommandLine</font>
{{event.ParentCommandLine}}


|<font color="#AAAAAA" size=2>Product</font>|<font color="#AAAAAA" size=2>FileVersion</font>|<font color="#AAAAAA" size=2>Description</font>|
|-|-|-|
|{{event.Product}}|{{event.FileVersion}}|{{event.Description}}|

|<font color="#AAAAAA" size=2>Company</font>|<font color="#AAAAAA" size=2>DeviceVendor</font>|<font color="#AAAAAA" size=2>FileVersion</font>|
|-|-|-|
|{{event.Company}}|{{event.DeviceVendor}}|{{event.FileVersion}}|

|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|

|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>ProcessId</font>|<font color="#AAAAAA" size=2>ProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.ProcessId}}|{{event.ProcessGuid}}|

|<font color="#AAAAAA" size=2>ParentProcessId</font>|<font color="#AAAAAA" size=2>ParentProcessGuid</font>|
|-|-|
|{{event.ParentProcessId}}|{{event.ParentProcessGuid}}|

`

//SYSMON EVENT ID 2
event['FileCreateTime'] = `

### <font color="#AAAAAA" size=2>TargetFilename</font>
{{event.TargetFilename}}

### <font color="#AAAAAA" size=2>Image</font>
{{event.Image}}


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|


|<font color="#AAAAAA" size=2>PreviousCreationUtcTime</font>|<font color="#AAAAAA" size=2>CreationUtcTime</font>|
|-|-|
|{{event.PreviousCreationUtcTime}}|{{event.CreationUtcTime}}|


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>ProcessId</font>|<font color="#AAAAAA" size=2>ProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.ProcessId}}|{{event.ProcessGuid}}|

`

//SYSMON EVENT ID 3
event['NetworkConnect'] = `
### <font color="#AAAAAA" size=2>Image</font>
{{event.Image}}


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|

|<font color="#AAAAAA" size=2>DestinationIp</font>|<font color="#AAAAAA" size=2>DestinationPort</font>|<font color="#AAAAAA" size=2>Protocol</font>|
|-|-|-|
|{{event.DestinationIp}}|{{event.DestinationPort}}|{{event.Protocol}}|

|<font color="#AAAAAA" size=2>DestinationHostname</font>|<font color="#AAAAAA" size=2>DestinationPortName</font>|<font color="#AAAAAA" size=2>DestinationType</font>|
|-|-|-|
|{{if(options.event.DestinationHostname != undefined)}}{{event.DestinationHostname}}{{/if}}|{{if(options.event.DestinationPortName != undefined)}}{{event.DestinationPortName}}{{/if}}|{{if(options.event.DestinationType != undefined)}}{{event.DestinationType}}{{/if}}|

|<font color="#AAAAAA" size=2>SourceIp</font>|<font color="#AAAAAA" size=2>SourcePort</font>|
|-|-|
|{{event.SourceIp}}|{{event.SourcePort}}|

|<font color="#AAAAAA" size=2>SourceHostname</font>|<font color="#AAAAAA" size=2>SourcePortName</font>|
|-|-|
|{{if(options.event.SourceHostname != undefined)}}{{event.SourceHostname}}{{/if}}|{{if(options.event.SourcePortName != undefined)}}{{event.SourcePortName}}{{/if}}|

`


//SYSMON EVENT ID 4
event['SysmonStatus'] = `

|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|

|<font color="#AAAAAA" size=2>State</font>|<font color="#AAAAAA" size=2>Version</font>|<font color="#AAAAAA" size=2>SchemaVersion</font>|
|-|-|-|
|{{event.State}}|{{event.Version}}|{{event.SchemaVersion}}|

`


//SYSMON EVENT ID 5
event['ProcessTerminate'] = `

### <font color="#AAAAAA" size=2>Image</font>
{{event.Image}}


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>ProcessId</font>|<font color="#AAAAAA" size=2>ProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.ProcessId}}|{{event.ProcessGuid}}|

`


//SYSMON EVENT ID 6
event['DriverLoad'] = `

### <font color="#AAAAAA" size=2>ImageLoaded</font>
{{event.ImageLoaded}}

### <font color="#AAAAAA" size=2>Hashes</font>
{{event.Hashes}}


|<font color="#AAAAAA" size=2>Signed</font>|<font color="#AAAAAA" size=2>Signature</font>|<font color="#AAAAAA" size=2>SignatureStatus</font>|
|-|-|-|
|{{event.Signed}}|{{event.Signature}}|{{event.SignatureStatus}}|


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|

`

//SYSMON EVENT ID 7
event['ImageLoad'] = `

### <font color="#AAAAAA" size=2>ImageLoaded</font>
{{event.ImageLoaded}}

### <font color="#AAAAAA" size=2>Hashes</font>
{{event.Hashes}}


### <font color="#AAAAAA" size=2>Image</font>
{{event.Image}}


|<font color="#AAAAAA" size=2>Signed</font>|<font color="#AAAAAA" size=2>Signature</font>|<font color="#AAAAAA" size=2>SignatureStatus</font>|
|-|-|-|
|{{event.Signed}}|{{event.Signature}}|{{event.SignatureStatus}}|


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>ProcessId</font>|<font color="#AAAAAA" size=2>ProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.ProcessId}}|{{event.ProcessGuid}}|

`


//SYSMON EVENT ID 8
event['CreateRemoteThread'] = `
### <font color="#AAAAAA" size=2>SourceImage</font>
{{event.SourceImage}}


### <font color="#AAAAAA" size=2>TargetImage</font>
{{event.TargetImage}}


|<font color="#AAAAAA" size=2>NewThreadId</font>|<font color="#AAAAAA" size=2>StartAddress</font>|<font color="#AAAAAA" size=2>StartModule</font>|<font color="#AAAAAA" size=2>StartFunction</font>|
|-|-|-|-|
|{{event.NewThreadId}}|{{event.StartAddress}}|{{event.StartModule}}|{{event.StartFunction}}|


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>SourceProcessId</font>|<font color="#AAAAAA" size=2>SourceProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.SourceProcessId}}|{{event.SourceProcessGuid}}|


|<font color="#AAAAAA" size=2>TargetProcessId</font>|<font color="#AAAAAA" size=2>TargetProcessGuid</font>|
|-|-|
|{{event.TargetProcessId}}|{{event.TargetProcessGuid}}|

`

//SYSMON EVENT ID 9
event['RawAccessRead'] =  `
### <font color="#AAAAAA" size=2>Device</font>
{{event.Device}}


### <font color="#AAAAAA" size=2>Image</font>
{{event.Image}}


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>ProcessId</font>|<font color="#AAAAAA" size=2>ProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.ProcessId}}|{{event.ProcessGuid}}|
`

//SYSMON EVENT ID 10
event['ProcessAccess'] = `
### <font color="#AAAAAA" size=2>SourceImage</font>
{{event.SourceImage}}


### <font color="#AAAAAA" size=2>TargetImage</font>
{{event.TargetImage}}


### <font color="#AAAAAA" size=2>CallTrace</font>
{{event.CallTrace}}

<br>

|<font color="#AAAAAA" size=2>GrantedAccess</font>|
|-|
|{{event.GrantedAccess}}|


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>SourceProcessId</font>|<font color="#AAAAAA" size=2>SourceProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.SourceProcessId}}|{{event.SourceProcessGuid}}|


|<font color="#AAAAAA" size=2>TargetProcessId</font>|<font color="#AAAAAA" size=2>TargetProcessGuid</font>|
|-|-|
|{{event.TargetProcessId}}|{{event.TargetProcessGuid}}|

`


//SYSMON EVENT ID 11
event['FileCreate'] = `
### <font color="#AAAAAA" size=2>TargetFilename</font>
{{event.TargetFilename}}


### <font color="#AAAAAA" size=2>Image</font>
{{event.Image}}


|<font color="#AAAAAA" size=2>CreationUtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|<font color="#AAAAAA" size=2>UtcTime</font>|
|-|-|-|
|{{event.CreationUtcTime}}|{{event.EventReceivedTime}}|{{event.UtcTime}}|


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>ProcessId</font>|<font color="#AAAAAA" size=2>ProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.ProcessId}}|{{event.ProcessGuid}}|

`

//SYSMON EVENT ID 12-14
event['RegistryEvent'] = `
### <font color="#AAAAAA" size=2>EventType</font>
{{event.EventType}}


### <font color="#AAAAAA" size=2>TargetObject</font>
{{event.TargetObject}}


### <font color="#AAAAAA" size=2>Image</font>
{{event.Image}}


### <font color="#AAAAAA" size=2>Details</font>
{{event.Details}}


### <font color="#AAAAAA" size=2>NewName</font>
{{event.NewName}}


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>ProcessId</font>|<font color="#AAAAAA" size=2>ProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.ProcessId}}|{{event.ProcessGuid}}|

`


//SYSMON EVENT ID 15
event['FileCreateStreamHash'] = `

### <font color="#AAAAAA" size=2>TargetFilename</font>
{{event.TargetFilename}}


### <font color="#AAAAAA" size=2>Hash</font>
{{event.Hash}}


|<font color="#AAAAAA" size=2>CreationUtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|<font color="#AAAAAA" size=2>UtcTime</font>|
|-|-|-|
|{{event.CreationUtcTime}}|{{event.EventReceivedTime}}|{{event.UtcTime}}|


### <font color="#AAAAAA" size=2>Image</font>
{{event.Image}}


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>ProcessId</font>|<font color="#AAAAAA" size=2>ProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.ProcessId}}|{{event.ProcessGuid}}|

`

//SYSMON EVENT ID 16
event['ConfigChanged'] = `

### <font color="#AAAAAA" size=2>Configuration</font>
{{event.Configuration}}


### <font color="#AAAAAA" size=2>ConfigurationFileHash</font>
{{event.ConfigurationFileHash}}


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|
|-|-|
|{{event.id}}|{{event.rid}}|
`

//SYSMON EVENT ID 17 & 18
event['PipeConnected'] = `

### <font color="#AAAAAA" size=2>PipeName</font>
{{event.PipeName}}


### <font color="#AAAAAA" size=2>Image</font>
{{event.Image}}


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>ProcessId</font>|<font color="#AAAAAA" size=2>ProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.ProcessId}}|{{event.ProcessGuid}}|
`

event['PipeCreated'] = `

### <font color="#AAAAAA" size=2>PipeName</font>
{{event.PipeName}}


### <font color="#AAAAAA" size=2>Image</font>
{{event.Image}}


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|<font color="#AAAAAA" size=2>ProcessId</font>|<font color="#AAAAAA" size=2>ProcessGuid</font>|
|-|-|-|-|
|{{event.id}}|{{event.rid}}|{{event.ProcessId}}|{{event.ProcessGuid}}|
`

//SYSMON EVENT ID 19 to 21
event['WmiEvent'] = `

|<font color="#AAAAAA" size=2>EventType</font>|<font color="#AAAAAA" size=2>Operation</font>|<font color="#AAAAAA" size=2>User</font>|
|-|-|-|
|{{event.EventType}}|{{event.Operation}}|{{event.User}}|


{{if(options.event.EventID == 19)}}
|<font color="#AAAAAA" size=2>Name</font>|<font color="#AAAAAA" size=2>EventNamespace</font>|
|-|-|
|{{event.Name}}|{{event.EventNamespace}}|


### <font color="#AAAAAA" size=2>Query</font>
{{event.Query}}
{{/if}}


{{if(options.event.EventID == 20)}}
|<font color="#AAAAAA" size=2>Name</font>|<font color="#AAAAAA" size=2>Type</font>|
|-|-|
|{{event.Name}}|{{event.Type}}|


### <font color="#AAAAAA" size=2>Destination</font>
{{event.Destination}}
{{/if}}


{{if(options.event.EventID == 21)}}
### <font color="#AAAAAA" size=2>Consumer</font>
{{event.Consumer}}


### <font color="#AAAAAA" size=2>Filter</font>
{{event.Filter}}
{{/if}}


|<font color="#AAAAAA" size=2>UtcTime</font>|<font color="#AAAAAA" size=2>EventReceivedTime</font>|
|-|-|
|{{event.UtcTime}}|{{event.EventReceivedTime}}|


|<font color="#AAAAAA" size=2>id</font>|<font color="#AAAAAA" size=2>@rid</font>|
|-|-|
|{{event.id}}|{{event.rid}}|

`

event['UntrustedFile'] = `

### <font color="#AAAAAA" size=2>File Path</font>
{{event.FullPath}}


|<font color="#AAAAAA" size=2>Signed</font>|<font color="#AAAAAA" size=2>Signature</font>|<font color="#AAAAAA" size=2>SignatureStatus</font>|
|-|-|-|
|{{event.Signed}}|{{event.Signature}}|{{event.SignatureStatus}}|


### <font color="#AAAAAA" size=2>Hashes</font>
{{event.Hashes}}
`

module.exports.lookUp = event