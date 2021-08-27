//@type
d

//parameters
e

//name
AssignDestinationType

//language
javascript

//code
try{
    var db = orient.getDatabase();

    var destinationType = 'external'
    var ipv6LocalCheck = /^fe80|^fc00|^fd00|^ff0/
	var internalCheck = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)|(^169\.254\.)|(^255\.255\.255\.255)|(^239\.255\.255\.250)/
    
    if('DestinationIp' in e) { // field absent -> exception
      if(e.DestinationIp.indexOf(':') > 0) {
        if(ipv6LocalCheck.test(e.DestinationIp)) destinationType = 'internal'  
      }
      else {    
        if(internalCheck.test(e.DestinationIp)) destinationType = 'internal'
      }
	  // check if it's proxy
      if(destinationType == 'internal' ){ 
        var proxy = db.query('SELECT from WebProxies WHERE Organisation = ? AND Address = ? AND Port = ?', 
                             e.Organisation, e.DestinationIp, e.DestinationPort )
        if(proxy.length > 0) destinationType = 'proxy'       
      }
    }
    e.DestinationType = destinationType
}
catch(err){
  var msg = 'AssignDestinationType: ' + err + ' | input: ' + JSON.stringify(e)
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "AssignDestinationType", Message = ?', msg)
}

