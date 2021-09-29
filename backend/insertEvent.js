require('dotenv').config()
const fs = require("fs")
const odb = new (require('../common/odb').Odb)();

console.log(process.env.UPLOAD_PATH)
if(!fs.existsSync(process.env.UPLOAD_PATH)) {
    console.log('Need a UPLOAD_PATH in .env'); return;    
}

var es = require('event-stream'); //install first: npm i event-stream
var lineCount = 0
var rowCount = 0
var fileQueue = []
var session = null
var recoverSeqCount = 0

// please quickly start this script after VM starts up
// ODB cannot cope with too many backlog files
console.log('Connecting to OrientDB....')

async function startWork(){
    session = await odb.startSession();
    if(session != null) {
        console.log('ODB client & session started')
        fs.readdir(process.env.TOBEINSERTED_PATH, function(err, items) {
            console.log(items); 
            for (var i=0; i<items.length; i++) {
                if(items[i].indexOf('rotated')>= 0) {
                    console.log('adding ' + items[i]);
                    fileQueue.push(process.env.TOBEINSERTED_PATH + '/' + items[i])
                }
            }
            processFile(fileQueue.shift())
        });
        
        const chokidar = require('chokidar');
        chokidar.watch(process.env.UPLOAD_PATH, {ignored: /(^|[\/\\])\../, persistent: true})
        .on('addDir', path => {
            if(path.indexOf('.uploaded') > -1 && path.indexOf('rotated') > -1){
                //delay to deal with slow SFTP client-side error of missing directory
                setTimeout(function(){  fs.rmdir(path, function(err){}) }, 500);
                let sourcePath = path.replace('.uploaded','')
                let destPath = path.replace('/uploads','/tobeinserted').replace('.uploaded','')
                fs.renameSync(sourcePath, destPath)
                fileQueue.push(destPath);
                processFile(fileQueue.shift());
            }
        })
        checkSession()
    }
    else console.error('Fail to connect to OrientDB!')
}

startWork();

//https://stackoverflow.com/questions/16010915/parsing-huge-logfiles-in-node-js-read-in-line-by-line
function processFile(filepath) {
    if(session == null) return
    if(fs.existsSync(filepath) == false) return
    console.log('Processing ' + filepath)
    let org = ""
    if(filepath.indexOf('Org_') > 0) {
        org = filepath.split("_")[1];
        console.log('OrgName: '+org)
    }
    var s = fs.createReadStream(filepath)
        .pipe(es.split())
        .pipe(es.mapSync(async function(line) {            
            s.pause(); // process line next and call s.resume() when rdy
            if(line.length > 0){
                line = await preProcess(line)            
                processLine(line, org) // resume the readstream, possibly from a callback
            } 
            //DO NOT use await for processLine
            s.resume();
        })
        .on('error', function(err){
            console.error('Error while reading file.', err);
        })
        .on('end', function(){
            console.log('Files in queue: ' + fileQueue.length)
            console.log('Total line count: ' + lineCount) // tally with row count
            console.log('Total row count:' + rowCount)
            console.log('Delta: ' + (lineCount - rowCount))     
            setTimeout(function(){ deleteFile(filepath) }, 200)
            s = null
            if(fileQueue.length > 0){
                processFile(fileQueue.shift())
            }
        })
    );    
}

function deleteFile(filepath) {
    if(!fs.existsSync(filepath)) return
    fs.unlink(filepath, (err) => {
        if (err) {
          console.error('retry deleting ' + filepath);
          deleteFile(filepath)
        }
        else {
          console.log(filepath + ' was deleted');
        }    
      });
}

/**
 * 
 * @param {escaped JSON line of Windows Event} eventline 
 * @param {String for multi-tenancy} organisation 
 * @returns 
 */
async function processLine(eventline, organisation) {
    if(session == null) return
    try {
        if(eventline.length > 0) {
            lineCount++
            //do no use await...
            session.query("select AddEvent(:data,:org)",{params:{data:escape(eventline),org:organisation}}).all();
            ++rowCount            
        }
    }
    catch(err) {
        var e = '' + err
        console.error('line length: ' + eventline.length)
        console.error('invalid JSON line:')
        console.error(eventline)
        console.error(e)
        if(e.indexOf('Cannot select the server') > 0) session = null
    }
}

/**
 * Checks session by calling ODB ConnectParentProcess() 
 * which connects parent to child processes.
 * Reconnects when session is dead.
 */
async function checkSession(){
    if(session == null) return;
    setTimeout(async function dequeue(){
        try {   
            if(session != null) {
                await session.query('SELECT dequeue()').all();
                if(recoverSeqCount++ > 59){
                    recoverSeqCount = 0
                    session.query('SELECT RecoverSequence()')
                }                 
            }
            else {
                session = await odb.startSession();
                console.log('reconnected!')
            }
        }
        catch(err) {
            console.error(err)
            session = null
        }
        setTimeout(dequeue,1000)
    },1000);
}

/**
 * Pre-process message to extract fields from 4688 & 4689 Message fields.
 * Note that Nxlog is not extracting the fields & ODB-AddEvent function 
 * removes Message field due to data-deduplication
 * 
 * @param {string} msg JSON event message
 * @returns JSON event string with extracted fields
 */
 async function preProcess(msg) {
    return new Promise((resolve, reject) => {
      try{
        let event = JSON.parse(msg)
        // Windows audit event 4688 & 4689 are generated ahead of respective Sysmon events
        if((event.EventID == 4688 || event.EventID == 4689) && event.Channel == 'Security' && 'Message' in event) {      
          let msg468X = event.Message.split('\r\n')
          for(var i=3; i< msg468X.length; i++) {            
            let match468X = msg468X[i].match(/\t(.+)\:\t+(.+)/mi)
            if(match468X == null) continue;
            if(match468X.length == 3) {                
                if (typeof match468X[1].replaceAll !== "undefined") { 
                // need to de-duplicate, otherwise ODB insert will fail
                    let key = match468X[1].replaceAll(' ','')
                    if(key in event) continue
                    event[key] = match468X[2]
                }
            }
          }
          
          if(event.EventID == 4688){
            let parentPID = event.Message.match(/\s+Creator Process ID\:\s+(.+)\s+/mi)
            if(parentPID.length > 1) event.PPID = parseInt(parentPID[1])
            
            let NewPID = event.Message.match(/\s+New Process ID\:\s+(.+)\s+/mi)
            if(NewPID.length > 1) event.PID = parseInt(NewPID[1]) 

            if(event.PPID == 4 && 'NewProcessName' in event){
                let newProcessName = event.NewProcessName.split('\\').reverse()[0]
                event.Sequence = 'System > ' + newProcessName
            }
          }
          if(event.EventID == 4689){
            let PID = event.Message.match(/\s+Process ID\:\s+(.+)\s+/mi)
            if(PID.length > 1) event.PID = parseInt(PID[1])
          }
        }
        // we added new fields to json object, need to return stringify
        //console.log(JSON.stringify(event))
        msg = JSON.stringify(event)
        resolve(msg)
      }  
      catch(error){
        reject(error)
      }
    })
}