const titles = {};

titles['CapturedFile'] = 
`Captured File <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font> {{if(options.event.IntezerVerdict != undefined)}} | <font color="#AAAAAA" size=2>Verdict</font>: {{event.IntezerVerdict}}{{/if}}
`

titles['ProcessCreate'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}} - Pid {{event.ProcessId}} 

{{if(options.event.ProcessType != undefined)}}{{event.ProcessType}}{{#else}}Pending...{{/if}}

User: {{event.User}}</font>

{{event.Image}}
`

titles['ProcessTampering'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>

{{event.Type}}
`

titles['FileCreateTime'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>

{{event.TargetFilename}}
`

titles['NetworkConnect'] = 
`<font color="#AAAAAA" size=2>{{event.UtcTimeFormatted}}</font>

Destination: {{event.DestinationIp}} 
{{event.Protocol}} port: {{event.DestinationPort}}
`

titles['SysmonStatus'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}


State:</font> {{event.State}}
`

titles['ProcessTerminate'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>


{{event.Image}}
`

titles['DriverLoad'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>


{{event.ImageLoaded}}
`

titles['ImageLoad'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>

{{event.ImageLoaded}}
`

titles['CreateRemoteThread'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>


Source: 
{{event.SourceImage}}


Target: 
{{event.TargetImage}}
`

titles['RawAccessRead'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>


{{event.Device}}
`

titles['ProcessAccess'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>


Source: 
{{event.SourceImage}}


Target: 
{{event.TargetImage}}
`

titles['FileCreate'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>


{{event.TargetFilename}}
`

titles['RegistryEvent'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}


EventType:</font> {{event.EventType}}


<font color="#AAAAAA" size=2>TargetObject</font>
{{event.TargetObject}}
`

titles['FileCreateStreamHash'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>


{{event.TargetFilename}}
`

titles['ConfigChanged'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>


{{event.Configuration}}
`

titles['PipeConnected'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>


{{event.PipeName}}
`

titles['PipeCreated'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>


{{event.PipeName}}
`

titles['WmiEvent'] = 
`{{event.SysmonClass}} <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>


{{event.Operation}} {{event.Name}}
`

titles['UntrustedFile'] = 
`Untrusted DLL <font color="#AAAAAA" size=2>@ {{event.UtcTimeFormatted}}</font>

{{event.FullPath}}
`

module.exports.lookUp = titles;