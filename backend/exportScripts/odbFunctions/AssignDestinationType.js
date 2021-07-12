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
AssignDestinationType

//language
javascript

//code
var db = orient.getDatabase();

var destinationType = 'external'
var ipv6LocalCheck = /^fe80|^fc00|^fd00|^ff0/
if(e['DestinationIp'].indexOf(':') > 0) {
	if(ipv6LocalCheck.test(e['DestinationIp'])) destinationType = 'internal'  
}
else {
   var internalCheck = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)|(^169\.254\.)|(^255\.255\.255\.255)|(^239\.255\.255\.250)/
   if(internalCheck.test(e['DestinationIp'])) destinationType = 'internal'
}

if(destinationType == 'internal' ){ // check if it's proxy
	var proxy = db.query('SELECT from WebProxies WHERE Organisation = ? AND Address = ? AND Port = ?', 
                             e['Organisation'], e['DestinationIp'], e['DestinationPort'] )
    if(proxy.length > 0) destinationType = 'proxy'       
}

e['DestinationType'] = destinationType

