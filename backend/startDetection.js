const jw = require('jaro-winkler');
const _threshold = 0.80

const _stage2Score = 20
const _stage3Score = 40

const _severityLevel1 = 1
const _severityLevel2 = 2
const _severityLevel3 = 3
const _severityLevel4 = 4

var _session = null;
var _orgStatus = {} // to check if profiling/detection phase

const odb = new (require('../common/odb').Odb)();

async function startWork(){    
    _orgStatus = await odb.readAllOrganistionsStatus();
    console.log('Read profiling statuses!')
    await odb.startMonitoringOrganisationStatus(_orgStatus);
    console.log('Monitoring profiling status changes & new sighting...')
    odb.startLiveQuery("select from SightedTracking", eventHandler)
    console.log('Monitoring SightedTracking...')
}

(async function(){                        
    _session = await odb.startSession()
    console.log('connected to ODB!')
    startWork()
    odb.setReconnectedHandler(async function(){
        console.log("ODB reconnected!")
        _session = odb.session;
        startWork();
    })
})();

// startLiveQuery will call this..
async function eventHandler(newEvent) {
    if(newEvent['operation'] != 1) return; // only interested with inserted/new object
    newEvent = newEvent['data']; 
    
    var rid = newEvent['@class'] == 'CommandLineSighted' || newEvent['@class'] == 'LateralCommunication' 
            || newEvent['@class'] == 'DllSighted' || newEvent['@class'] == 'Tampered' || newEvent['@class'] == 'WrittenFileSighted' ? newEvent['out'] : newEvent['in'];

    let event = await _session.query('SELECT FROM ' + rid).all()
    //.on('data', async (event)=>{ //handling various child classes of SightedTracking
    if(event.length > 0) {
        event = event[0];
        if(_orgStatus[event['Organisation']] == 1) return; // skip due to profiling on 
        //console.log(newEvent['out'] + ':' + newEvent['@class'] + ':' + event['@rid'])
        switch(newEvent['@class']) {
            // Type 1 - Foreign Binaries; new Hashes
            case 'ExeSighted': // Type 1 - Foreign EXE
                handleEXE(event); // event is a ProcessCreate
                break;  

            case 'DllSighted': // Type 1 - Foreign DLL
                handleDLL(event); // if score > 0 then output event is ProcessCreate, else ImageLoad
                //if(event['@class'] == 'ProcessCreate') updateCase(0,event['Hostname'],event['@rid'],"Loaded Foreign DLL")            
                break;   
    
            case 'SysSighted': // Type 1 - Foreign/new SYS driver
                handleSYS(event); // event is a DriverLoad
                return; // no need for subsequent checks for Privilege & Persistence
    
            case 'CommandLineSighted': // Type 2
                event = await handleCommandLine(event, newEvent['in']); //in-event is a HUPC object, 2nd param is a ProcessCreate
                break;
            
            // Type 3 - Contents Exploitation that triggers new/usual process sequences
            // if process is foreground, then it may be due to user behavior deviations
            case  'SequenceSighted':
                handleSequence(event); // event is a ProcessCreate
                // Score is assigned only at detection stage... ie. this script is not executed during profiling stage.
                _session.command('Update ' + newEvent['out'] + ' SET Score = ' + _stage2Score)
                break;
            
            case 'SpoofedParentProcess':
                checkSpoofedProcess(event)
                return

            case 'LateralCommunication':
                handleLateralComm(event);
                break;

            case 'SftpIntrusionSighted':
                updateCase(_stage3Score,event['Organisation'],event['Hostname'],event['@rid'], 'SFTP Intrusion', _severityLevel3)
                break;

            case 'Tampered':
                updateCase(_stage2Score,event['Organisation'],event['Hostname'],event['@rid'], 'Process Tampering', _severityLevel2)
                break;
            
            case 'WrittenFileSighted':
                console.log('CapturedFile sighted')
                updateCase(0,event['Organisation'],event['Hostname'],event['@rid'], 'Captured File', _severityLevel1)
                break;

            case 'Rebooted':
                console.log('Linking reboot event to case...')
                updateCase(0,event['Organisation'],event['Hostname'],event['@rid'], 'Rebooted', _severityLevel1)
                return; // otherwise it will be taken as Privileged Execution

            default:
                return;
        }  
        if(event === undefined) return  //some of the await may return undefined
        if(event['@class'] == 'ProcessCreate') {
            addToWatchlist(event['Organisation'],event['Hostname'],event['ProcessGuid'],event['@rid'])
            checkPrivilege(event); //for both ExeSighted & SequenceSighted only
            checkBeforeExplorer(event) //check for early persistence
            checkNetworkEvents(event) // check for external C2
            findLastInteractiveProcess(event) // What was the last foreground process?
            linkLastNprocesses(event,6) // show 6 earlier processes
        }
    //})
    }    
}

function addToWatchlist(organisation, hostname, processguid, rid){
    _session.command(`UPDATE Watchlist SET Count = Count + 1 UPSERT WHERE Organisation = '${organisation}' AND Hostname = '${hostname}' AND ProcessGuid = '${processguid}' AND PCrid = '${rid}'`)
}

function findLastInteractiveProcess(event){
    console.log('find last user interaction... ')
    _session.query('select FindLastForeground("' + event['@rid'] + '")')
}

function linkLastNprocesses(event,n){
    console.log('find last ' + n + ' processes...')
    _session.query('select FindPreviousProcesses(:e,:n)',{ params : {e: event['@rid'], n:n}})
}

function linkSimilarTo(startRID, endRID) {
    _session.command('CREATE EDGE SimilarTo FROM :h TO :c',
    { params : {h: startRID, c: endRID}})
    .on('error', (err)=>{
        var msg = '' + err
        if(msg.indexOf('modified')) {
            linkSimilarTo(startRID, endRID)
        }
        else
            console.error(msg)
    })
}

/// returns existing score or 30 for new Commandline cluster
function findCommandLineCluster(hupc){
    return new Promise( async(resolve, reject) => {
        _session.query("select from CommandLineCluster WHERE Program = :p", { params : {p: hupc['Program']}})
        .all() 
        .then((results)=>{
            var found = false
            var clusterid = ''
            var clusterscore = 0
            var prevSimilarity = 0
            for(var i = 0; i < results.length; i++){ // need to find the MOST similiar, ie. highest jw score
                var similarity = jw(hupc['CommandLine'],results[i]['CommandLine'])
                if(similarity > _threshold) {
                    found = true;
                    // we want the highest similarity
                    if(similarity > prevSimilarity) { 
                        clusterid = results[i]['@rid']
                        clusterscore = results[i]['Score']
                        prevSimilarity = similarity
                    }
                }
            }
            if(found){
                // show only score > 0, less clutter
                if(clusterscore > 0) console.log('Found similar commandline with score: '+ clusterscore + ', creating link from ' + hupc['@rid'] + ' to ' + clusterid)
                linkSimilarTo(hupc['@rid'], clusterid)
                resolve(clusterscore) // assuming known malicious CommandLine is assigned with score
            }
            else {
                _session.command('INSERT INTO CommandLineCluster SET CommandLine = :c, Program = :p, Score = ' + _stage2Score, 
                { params : {c: hupc['CommandLine'], p:hupc['Program']}})
                .on('data',(cc) =>{
                    linkSimilarTo(hupc['@rid'],cc['@rid'])
                })
                resolve(_stage2Score)
            }
        })
    });
}

function linkToCase(startRID, endRID, score, reason) {
    _session.command('CREATE EDGE AddedTo FROM :h TO :c SET datetime = sysdate(), score = ' + score + ", reason = '" + reason + "'",
    { params : {h: startRID, c: endRID}})
    .on('error', (err)=>{
        var msg = '' + err
        if(msg.indexOf('modified')) {
            linkToCase(startRID, endRID)
        }
        else
            console.error(msg)
    })
}

async function updateCase(score, organisation, hostname, eventRid, reason = '', SeverityLevel = 1) {
    let events = await _session.query('SELECT FROM AddedTo WHERE reason = :r AND out = :o', { params : {r: reason, o: eventRid}}).all()
    if(events.length > 0) {
        console.log(reason + ' already added for ' + eventRid)
        return
    }
    let c = await _session.command('Update Case SET Score = Score + :sc UPSERT RETURN AFTER \
            @rid, Score, SeverityLevel, Organisation WHERE Organisation = :o AND Hostname = :h \
            AND NOT State = "closed"',{ params : {o: organisation, sc: score, h: hostname}}).all()
    c = c[0]
    console.log(c['@rid'])
    linkToCase(eventRid,c['@rid'], score, reason)        
    if(hostname.toLowerCase().indexOf('www') == 0) SeverityLevel = 1
    if(SeverityLevel > c['SeverityLevel']) { // we need to maintain severity level
        _session.command('Update :rid SET SeverityLevel = :level',{ params : {rid: c['@rid'], level: SeverityLevel}})
    }
    console.log('\nReason: ' + reason + ' | Case id: ' + c['@rid'] + ' | score: ' + c['Score'] + ' | Severity: ' + SeverityLevel + '\n')
}

// newEvent is a Sysmon DriverLoad event
function handleSYS(newEvent) { // currently hardcoded to trust only Microsoft Windows signature
    var score = _stage2Score;
    console.log('Signature:' + newEvent['Signature']);
    console.log('SignatureStatus:' + newEvent['SignatureStatus']);
    score = newEvent['SignatureStatus'] == 'Valid' ? score : score + _stage2Score;
    score = newEvent['Signature'] == 'Microsoft Windows' || newEvent['Signature'] == 'Microsoft Corporation' ? score : score + _stage2Score;
    updateCase(score,newEvent['Organisation'],newEvent['Hostname'],newEvent['@rid'], "Foreign SYS Driver", _severityLevel3)
}

async function handleDLL(newEvent) { // currently hardcoded to trust only Microsoft Windows signature
    return new Promise( async(resolve, reject) => {
        var score = 0;
        if(newEvent['@class']=='ProcessCreate'){
            updateCase(_stage2Score,newEvent['Organisation'],newEvent['Hostname'],newEvent['@rid'] , "Loaded Foreign DLL", _severityLevel2)
            resolve(newEvent)
        }

        if(newEvent['@class']=='ImageLoad'){
            score = newEvent['SignatureStatus'] == 'Valid' ? score : score + _stage2Score;
            score = "${newEvent['Signature']}".indexOf('Microsoft') == 0 ? score : score + _stage2Score; 
            if(score > 0) {  //delaying to avoid duplicated LoadedImage
                setTimeout(async function(){ 
                    updateCase(score,newEvent['Organisation'],newEvent['Hostname'],newEvent['@rid'] , "Foreign DLL", _severityLevel2) 
                    event = await _session.query("select expand(in('LoadedImage')) from " + newEvent['@rid']).all()
                    console.log('handleDLL expanding in(LoadedImage)' + event.length)
                    if(event.length == 0) return undefined
                    // Portable EXEs are also ImageLoaded, we don't want to double score
                    console.log(event[0]['Image']);
                    if(event[0]['Image'] != newEvent['ImageLoaded'])  {
                        resolve(event[0]);
                    }
                },100) 
            }
            else { resolve(newEvent); }
        }        
    });
}

function handleEXE(newEvent) {
    var score = _stage2Score;
    console.log('New EXE:' + newEvent['Image'])
    //--- start exclusions ---- can also be excluded in sysmon configuration
    score = newEvent['Image'].indexOf('C:\\Windows\\SoftwareDistribution') == 0 ? 0 : score;
    score = newEvent['Image'].indexOf('DismHost.exe') > 0 && newEvent['Image'].indexOf('C:\\Windows\\System32') == 0 ? 0 : score; 
    //--- end exclusions -----
        
    if(score > 0) {
        updateCase(score,newEvent['Organisation'],newEvent['Hostname'],newEvent['@rid'], 'Foreign EXE', _severityLevel2)
    }
}


// Type 2 - Abuse Existing Tools, unusual CommandLines
async function handleCommandLine(hupc, inRid) {
    var score = await findCommandLineCluster(hupc) 
    if(score > 0) {
        _session.command('update ' + hupc['@rid'] + ' set Score = ' + score)
        if(score == _stage2Score) {
            console.log('Found new CommandLine cluster!')
            updateCase(score,hupc['Organisation'],hupc['Hostname'],inRid, 'Unusual CommandLine', _severityLevel2)
        }
        else {
            console.log('Using score from existing CommandLine cluster!')
            updateCase(score,hupc['Organisation'],hupc['Hostname'],inRid, 'Known Malicious CommandLine', _severityLevel2)
        }
        event = await _session.query("select from " + inRid).all() //return processcreate
        if(event.length > 0) return new Promise( async(resolve, reject) => { resolve(event[0]) })
    }
    else { return new Promise( async(resolve, reject) => { resolve(hupc) })  }
}

// Type 3 or could be triggered by users exploring new apps
function handleSequence(newEvent) {
    var score = _stage2Score;
    console.log('New sequence seen with:' + newEvent['Image'])
    updateCase(score,newEvent['Organisation'],newEvent['Hostname'],newEvent['@rid'], 'Unusual Process Sequence', _severityLevel2)
}

function handleLateralComm(newEvent) { //newEvent is NetworkConnect
    if(newEvent['in_DestinationPortSighted'] != undefined) {
        //--- start exclusions -----
        if(newEvent['Image'] == 'C:\\Windows\\System32\\svchost.exe' && newEvent['SourcePortName'] == 'ssdp') {
            return
        }
        if(newEvent['Image'] == 'C:\\Windows\\System32\\svchost.exe' && newEvent['SourcePortName'] == 'ws-discovery') {
            return
        }
        if(newEvent['Image'] == 'C:\\Windows\\System32\\svchost.exe' && newEvent['SourcePortName'] == 'llmr') {
            return
        }
        if(newEvent['Image'] == 'System' && newEvent['SourcePortName'] == 'wsd') {
            return
        }
        if(newEvent['Image'] == 'C:\\Windows\\System32\\dasHost.exe' && newEvent['SourcePortName'] == 'ws-discovery') {
            return
        }
        //--- end exclusions -----
        
        console.log('\nFound lateral communication...\n')
        updateCase(_stage3Score,newEvent['Organisation'],newEvent['Hostname'],newEvent['@rid'], 'Lateral Communication', _severityLevel3)
    }
}

function checkBeforeExplorer(processCreate){
    var checkBefore = function() { // avoid duplicated scores
        _session.query('SELECT FROM ' + processCreate['@rid'])
        .all()
        .then((event)=>{
            if(event.length > 0) {
                console.log('checking before explorer type... ' + event[0]['ProcessType'])
                var score = event[0]['ProcessType'] == 'BeforeExplorer' ? _stage3Score : 0;
                if(score > 0) updateCase(score,event[0]['Organisation'],event[0]['Hostname'],event[0]['@rid'], 'Executed Before Explorer', _severityLevel2)
            }
        })    
    }
    setTimeout(checkBefore, 70000) // ProcessCreate will be added to watchlist anyway for real-time linking
}

function checkPrivilege(processCreate){
    var score = 0; 
    score = processCreate['IntegrityLevel'] == 'High' ? score + _stage3Score : score;
    score = processCreate['IntegrityLevel'] == 'System' ? score + _stage3Score : score;
    console.log('IntegrityLevel: ' + processCreate['IntegrityLevel'])
    if(score > 0) updateCase(score,processCreate['Organisation'],processCreate['Hostname'],processCreate['@rid'], 'Privileged Execution', _severityLevel3)
}

function checkNetworkEvents(processCreate) {
     var checkNetwork = function() {  // avoid duplicated scores
        console.log('Checking for outbound network comms for ' + processCreate['@rid'])
        _session.query('SELECT FROM NetworkConnect WHERE DestinationType = "external" AND ProcessGuid = "' + processCreate['ProcessGuid'] + '"')
        .all()
        .then((event)=>{
            if(event.length > 0) {
                console.log('Found Outbound Network Communications')
                updateCase(_stage2Score,processCreate['Organisation'],processCreate['Hostname'],processCreate['@rid'], 'Outbound Network Communications', _severityLevel2)
            }
        })    
    }
    setTimeout(checkNetwork, 20000) // ProcessCreate will be added to watchlist anyway for real-time linking
}

function checkSpoofedProcess(processCreate) {
    var checkSpoof = function() { // avoid duplicated scores
        _session.query('SELECT FROM ' + processCreate['@rid'])
        .all()
        .then((event)=>{
            if(event.length > 0) {
                if('out_AddedTo' in event[0]) { // added to case for OTHER reasons
                    console.log('Found Spoofed Parent ProcessId')
                    updateCase(_stage2Score,processCreate['Organisation'],processCreate['Hostname'],processCreate['@rid'], 'Spoofed Parent ProcessId', _severityLevel2)
                }
            }
        })    
    }
    setTimeout(checkSpoof, 10000) // ProcessCreate will be added to watchlist anyway for real-time linking
}