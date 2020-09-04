const fs = require("fs");
require('dotenv').config()
const g_C2path = process.env.C2_PATH
const odb = new (require('../common/odb').Odb)();

function handleNewResponse(newResponse) { 
    if(newResponse['operation'] != 1) return
    
    var dirPath = ""
    var filename = newResponse['data']['Type'] + '_' + Date.now()
    // targetted request
    if('Hostname' in newResponse['data'] && 'Organisation' in newResponse['data']) {
        console.log("Writing targetted request...")
        dirPath = g_C2path + newResponse['data']['Organisation'] + '/' + newResponse['data']['Hostname']
        filename = dirPath + '/' + filename
    }
    else {        
        if('Organisation' in newResponse['data']) {
            dirPath = g_C2path + 'broadcast/' + newResponse['data']['Organisation'] + '/'
        }
        else {
            dirPath = g_C2path + 'broadcast/MyCompany/'            
        }
        console.log("Writing broadcast request to " + dirPath)
        filename = dirPath + '/' + filename
    }
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, {recursive:true})
    var contents = ''
    if(newResponse['data']['Type'] == 'osquery') contents = newResponse['data']['@rid'] + '\n' + newResponse['data']['Payload'];
    else contents = newResponse['data']['Payload']
    
    fs.writeFile(filename, contents, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("Response request was saved!");
        // delayed deletion of request file
        setTimeout(function() {
            fs.unlink(filename, function (err) {
                if (err) return console.log(err);
                console.log('File deleted!');
            }); 
        },300000) // delete 5 minutes later
    }); 
}

function reconnected(){
    console.log('re-establishing live query...')
    odb.startLiveQuery('select from ResponseRequest', handleNewResponse);
}

(async function(){
    if (!fs.existsSync(g_C2path + 'broadcast')){
        console.log('Creating broadcast folder once...')
        //no try catch since script should not carry on if it has no permission
        fs.mkdirSync(g_C2path + 'broadcast') 
    }
    odb.startLiveQuery("select from ResponseRequest", handleNewResponse)
    odb.setReconnectedHandler(reconnected)
})();