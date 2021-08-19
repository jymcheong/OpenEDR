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

// please quickly start this script after VM starts up
// ODB cannot cope with too many backlog files
console.log('Connecting to OrientDB....')

async function startWork(){
    session = await odb.startSession();
    if(session != null) {
        console.log('ODB client & session started')
        fs.readdir(process.env.UPLOAD_PATH, function(err, items) {
            console.log(items); 
            for (var i=0; i<items.length; i++) {
                if(items[i].indexOf('rotated')>= 0 && items[i].indexOf('.uploaded')>= 0) {
                    console.log('adding ' + items[i]);
                    fileQueue.push(process.env.UPLOAD_PATH + '/' + items[i].replace('.uploaded',''))
                    if(fs.existsSync(items[i])) { 
                        fs.rmdirSync(items[i]); 
                    }
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
                fileQueue.push(path.replace('.uploaded',''));
                processFile(fileQueue.shift());
            }
        })
        checkSession()
    }
    else console.error('Fail to connect to OrientDB!')
}

startWork();

//processFile('/tmp/events.txt') // test single file

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
            //DO NOT use await for processLine
            processLine(line, org) // resume the readstream, possibly from a callback
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
            setTimeout(function(){ deleteFile(filepath) },200)
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

//push most of the logic into server side function
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

async function checkSession(){
    if(session == null) return;
    setInterval(async function(){
        try {   
            if(session != null) {
                await session.query('SELECT ConnectParentProcess()').all();                    
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
    },3000);
}
