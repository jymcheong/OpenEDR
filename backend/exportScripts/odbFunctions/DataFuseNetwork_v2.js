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
DataFuseNetwork_v2

//language
javascript

//code
// pre-processing routine called by AddEvent
var db = orient.getDatabase();

if(e['EventID']==3 || e['EventID']==4) {
	var lp = db.command('UPDATE NetworkListeningPort set Count = Count + 1 \
             UPSERT RETURN AFTER @rid, Count WHERE Hostname = ? AND Organisation = ? AND \
			 TransportProtocol = ? AND LocalAddress = ? AND LocalPort = ? AND \
 			 ProcessId = ? AND ProcessName = ?',
             e['Hostname'], e['Organisation'], e['TransportProtocol'], e['LocalAddress'],
             e['LocalPort'],e['ProcessId'],e['ProcessName'])
              
	if(lp[0].getProperty('Count') == 1 && e['ProcessName'] != 'System'){ // new listening port
        db.command('CREATE EDGE ListeningPortSighted FROM ? TO \
        (SELECT FROM ProcessCreate WHERE Hostname = ? AND Organisation = ? AND \
		ProcessId = ? order by id desc LIMIT 1) RETRY 10 WAIT 10', lp[0].getProperty('@rid'),e['Hostname'],
        e['Organisation'], e['ProcessId'])
	}	
}
  
if(e['EventID']==1 || e['EventID']==2) {
	print('network address for ' + e['Hostname'] + ' ' + e['IpAddress'])
    db.command('UPDATE NetworkAddress set Count = Count + 1 \
                   UPSERT RETURN AFTER @rid, Count WHERE Hostname = ? AND \
				   Organisation = ? AND PhysicalAddress = ? AND IpAddress = ?',
                   e['Hostname'], e['Organisation'], e['PhysicalAddress'],e['IpAddress'])
}

// returning zero tells AddEvent to not continue any further
return 0

