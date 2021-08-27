//@type
d

//parameters
r

//name
NetworkConnect

//language
javascript

//code
var db = orient.getDatabase();
var rid = r.field('@rid')

function findLateral(r) {
        var lateral = null // look for lateral destination
        if(r.field('DestinationHostname')){
            lateral = db.query('SELECT FROM NetworkAddress WHERE Hostname = ? AND Organisation = ? AND Hostname <> ?',r.field('DestinationHostname'), r.field('Organisation'), r.field('Hostname'))
            if(lateral.length > 0) return lateral
        }
        if(r.field('DestinationIp')){ // handles both IPv4 & 6
            lateral = db.query('SELECT FROM NetworkAddress WHERE IpAddress = ? AND Hostname <> ? AND Organisation = ?',
                               r.field('DestinationIp'),r.field('Hostname'),r.field('Organisation')) 	
            if(lateral.length > 0) return lateral
        }
        return null
}

try{
    //print('NetworkConnect ' + r.field('Image'))
    // This UPSERT will return #NN:-N rid if called via Dynamic Hook
    var u = db.command('UPDATE NetworkDestinationPort set Count = Count + 1 \
                          UPSERT RETURN AFTER @rid, Count WHERE Image = ? AND \
                          Hostname = ? AND Organisation = ? AND Port = ?', 
                          r.field('Image'), r.field('Hostname'),r.field('Organisation'), 	
                          r.field('DestinationPort'))
    if(u[0].field('Count') == 1) { // new destination port sighted for that Process-Image
        retry("db.command('CREATE EDGE DestinationPortSighted \
            FROM " + u[0].field('@rid') + " TO " + r.field('@rid') + "')")
    } 

    // Find ProcessCreate to connect to...
    var pc = db.query('SELECT FROM ProcessCreate WHERE Organisation = ? AND Hostname = ? AND ProcessGuid = ?', r.field('Organisation'), r.field('Hostname'), r.field('ProcessGuid'))
    if(pc.length > 0) {
        var edgeName = r.field('DestinationType') == 'proxy' ? 'UsedProxy' : 'ConnectedTo';
        retry("db.command('CREATE EDGE " + edgeName + " FROM " + pc[0].field('@rid') + " TO " + rid + "')")
    }

    // Added codes
    if(r.field('DestinationPort') == 2222 && r.field('DestinationIp') == "192.168.1.7" && r.field('Image') != "C:\\Windows\\openedr\\Upload.exe") {
        // For debugging purposes
        print('Unauthorised access to SFTP event receiver service by ' + r.field('Image'))
        // Create SftpIntrusionSighted edge from ProcessCreate to NetworkConnect
        retry("db.command('CREATE EDGE SftpIntrusionSighted FROM " + pc[0].field('@rid') + " TO " + rid + "')")
    }

    //even if ProcessCreate cannot be found
    retry("db.command('UPDATE " + rid + " SET ToBeProcessed = false')") 
  
    // likely no proxy in environment, direct connection to external address
    if(r.field('DestinationType') == 'external') return 

    // Find ListeningPort to connect to if exist...
    var lateral = findLateral(r)
    if(lateral == null) return;

    //print('Found lateral communication, finding destination listeningPort for ' + rid)
    var listening = db.query('SELECT FROM listeningport WHERE Hostname = ? AND Organisation = ? AND LocalPort = ?',lateral[0].field('Hostname'), lateral[0].field('Organisation'), r.field('DestinationPort'))
    if(listening.length == 0) return;

    // in web proxied environment, endpoint may be connecting to proxy constantly, that's what Sysmon can only see 
    retry("db.command('CREATE EDGE LateralCommunication FROM " + rid + " TO " + listening[0].getProperty('@rid') + " ')")

    if(listening[0].field('out_ListeningPortSighted') != null || listening[0].field('out_BoundTo') != null) return

    var lpc = db.query('SELECT FROM ProcessCreate WHERE Hostname = ? AND Organisation = ? AND ProcessId = ? AND Image.IndexOf(?) > -1 \
                        order by id desc LIMIT 1', listening[0].field('Hostname'), listening[0].field('Organisation'),
                        listening[0].field('ProcessId'), listening[0].field('ProcessName'))
    if(lpc.length == 0) return;

    retry("db.command('CREATE EDGE BoundTo FROM "+listening[0].getProperty('@rid')+" TO "+lpc[0].getProperty('@rid')+"')")
    print('Added BoundTo edge between ' + listening[0].getProperty('@rid') + ' to ' + lpc[0].getProperty('@rid'))

}
catch(err){
  var msg = 'NetworkConnect: ' + err + ' | input: ' + rid
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "NetworkConnect", Message = ?', msg)
}


