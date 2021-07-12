//@type
d

//@version
1

//@class
OFunction

//idempotent
null

//parameters
e

//name
Microsoft_Windows_Sysmon

//language
javascript

//code
// pre-processing routine called by AddEvent
var db = orient.getDatabase();

e['_classname'] = eventIdLookup(e['EventID'])
// Nxlog puts Sysmon ProcessId into this field, we want the ProcessCreate.ProcessId
e['SysmonProcessId'] = e['ProcessID']
delete e['ProcessID']
var re = /ProcessId: (\d+)/g
var match = re.exec(e['Message'])
if(match != null) e['ProcessId'] = parseInt(match[1]);

// general correction, on some endpoints, these field names are inconsistent 
if(e["SourceProcessGUID"]) e["SourceProcessGuid"] = e["SourceProcessGUID"]; 
if(e["TargetProcessGUID"]) e["TargetProcessGuid"] = e["TargetProcessGUID"]; 
//force ProcessGuid fields to upper case, these fields end up lower-case on some endpoints 
if(e['ProcessGuid']) e['ProcessGuid'] = e['ProcessGuid'].toUpperCase()
if(e['ParentProcessGuid']) e['ParentProcessGuid'] = e['ParentProcessGuid'].toUpperCase()
if(e['SourceProcessGuid']) e['SourceProcessGuid'] = e['SourceProcessGuid'].toUpperCase()  
if(e['TargetProcessGuid']) e['TargetProcessGuid'] = e['TargetProcessGuid'].toUpperCase()   
    
if(e['_classname'] == 'ProcessCreate') {
	// for building parentOf-sequence; see UpdateSequence function
    if(e['ParentImage'] == "System") {  
    	e['Sequence'] = 'System > smss.exe'
        e['ToBeProcessed'] = false
	}
    UpdateProcessTypeLookup(e)
    AssignProcessType(e)
    CheckSysmonBug(e)
  
    if(e['ParentImage'] != "System") {  
      var parent = db.query('SELECT FROM ProcessCreate \
	  where Organisation = ? AND Hostname = ? AND ProcessGuid = ?', e['Organisation'], 			  e['Hostname'], e['ParentProcessGuid'])
      if(parent.length > 0) {
         //print('Assigned parent RID ' + parent[0].field('@rid') + ' for ' + e['Image'])
         e['ParentRID'] = parent[0].field('@rid')
         // valid lineage sequence starts with System > ...
         if(parent[0].field('Sequence') != null && parent[0].field('Sequence').indexOf('System') == 0) {
         	var exename = e['Image'].split("\\")
			exename = exename[exename.length - 1]
            e['Sequence'] = parent[0].field('Sequence') + ' > ' + exename
         }
      }
      //else print('Parent NOT found ' + e['Image'])
    }
}

if(e['_classname'] == 'NetworkConnect') {
  AssignDestinationType(e)
}

return e

