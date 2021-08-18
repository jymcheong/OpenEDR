const fs = require("fs");
const path = require("path");
const chokidar = require('chokidar');
require('dotenv').config()
const g_C2path = process.env.C2_PATH
const odb = new (require('../common/odb').Odb)();
// this limits the # of parallel Intezer analysis jobs
const THROTTLE_LIMIT = 1
var g_module_holder = {}
var g_SampleQueue = []
var g_workingQueue = []
var odbSession = null

// Handler for new record written to ResponseRequest class
// ResponseRequest.Payload can be a C# script or osquery statement
function handleNewResponse(newResponse) { 
    if(newResponse['operation'] != 1) return //we r only concern with record INSERTed
    
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

function moveSample2Archive(inFile) {
    let dirSignalPath = inFile + '.uploaded'
    let basefilename = path.basename(inFile)
    let destPath = path.join(process.env.SAMPLES_ARCHIVE_PATH,basefilename)
    fs.rename(inFile,destPath, function (err) {
        //if (err) throw err
        console.log('Successfully moved to ' + destPath)
        fs.rmdirSync(dirSignalPath)
    })
}

function startSampleMonitoring(path){
    chokidar.watch(path, {ignored: /(^|[\/\\])\../, persistent: true})
    .on('addDir', dirSignalPath => {
        // we only respond when signalling directory is written after sample uploaded
        if(dirSignalPath.indexOf('.uploaded') > -1 && dirSignalPath.indexOf('sample') > -1){
            dirSignalPath = './' + dirSignalPath // some how it starts with subfolder name            
            // remove .uploaded to get sample file-name            
            let samplePath = dirSignalPath.replace('.uploaded','')
            if(fs.existsSync(samplePath)) {
                if(Object.keys(g_module_holder).length > 0) {               
                    //g_module_holder['intezer'].default(samplePath, odbSession)
                    g_SampleQueue.push(path.resolve(samplePath));
                }
                else { // just move sample to archive folder
                    moveSample2Archive(samplePath)                    
                }
            }
        }
    })
}

// main function
(async function(){
    if (!fs.existsSync(g_C2path + 'broadcast')){
        console.log('Creating broadcast folder once...')
        //no try catch since script should not carry on if it has no permission
        fs.mkdirSync(g_C2path + 'broadcast') 
    }
    odbSession = await odb.startLiveQuery("select from ResponseRequest", handleNewResponse)
    console.log('Live query on ResponseRequest class started!') 
    odb.setReconnectedHandler(reconnected)

    // - shift sample to archive folder when INTEZER API is not present
    if(process.env.INTEZER_APIKEY !== undefined) {
        console.log('Intezer API found! Loading extension...')        
        g_module_holder['intezer'] = await import('./extensions/intezer/intezer.mjs');             
        setInterval(async function(){
            // need to have a flag to track intezer work-in-progress so as to not overload...
            if(g_workingQueue.length >= THROTTLE_LIMIT) {
                console.log('Queue limit reached...')
                return
            }
            if(g_SampleQueue.length == 0) return
            let filePath = g_SampleQueue.shift()
            g_workingQueue.push(fileName)
            await g_module_holder['intezer'].default(filePath, odbSession)
            g_workingQueue.shift()
            moveSample2Archive(filePath)            
        }, 1000);
    }
    
    startSampleMonitoring(process.env.UPLOAD_PATH)
})();