const jw = require('jaro-winkler');
const _threshold = 0.80

var _hupcQ = []
var _orgStatus = {} // to check if profiling/detection phase
var _session = null;

const odb = new (require('../common/odb').Odb)();

async function startWork(){
    _orgStatus = await odb.readAllOrganistionsStatus();
    console.log('Read profiling statuses!')
    await odb.startMonitoringOrganisationStatus(_orgStatus);
    console.log('Start organistation-profiling-status monitoring...')
    // start monitoring new CommandLine that cannot fit into HUPC class
    // HUPC is short for HostUserPrivilegeCommandLine
    odb.startLiveQuery("select from hupc", eventHandler)
    console.log("Monitoring HostUserPrivilegeCommandLine...")
}

(async function(){
    _session = await odb.startSession();
    console.log('connected to ODB!')
    startWork();    
    odb.setReconnectedHandler(async function(){
        console.log("ODB reconnected!")
        _session = odb.session;
        startWork();
    })
})();

function eventHandler(newEvent) { 
    if(newEvent['operation'] != 1) return; // only interested with inserted/new object
    newEvent = newEvent['data'] 
    if( !(newEvent['Organisation'] in _orgStatus)) {
        _orgStatus[newEvent['Organisation']] = 1;
        odb.addOrganisation(newEvent['Organisation']);
    }
    if(_orgStatus[newEvent['Organisation']] == 2) return; // skip due to detection phase
    console.log(newEvent)
    _hupcQ.push(newEvent)
    processQitem()
}

function newCluster(hupc){
    _session.command('INSERT INTO CommandLineCluster SET CommandLine = :c, Program = :p', 
    { params : {c: hupc['CommandLine'], p:hupc['Program']}})
    .on('data',(cc) =>{
        _session.command('CREATE EDGE SimilarTo FROM :h TO :c',
        { params : {h: hupc['@rid'], c: cc['@rid']}})
        .on('data', (st)=>{
            console.log('Linked to existing cluster')
        })
    })
}

function processQitem() {
    if(_hupcQ.length == 0) return 
    var hupc = _hupcQ.shift()
    _session.query("select from CommandLineCluster WHERE Program = :p", { params : {p: hupc['Program']}})
    .all()
    .then((results)=>{
        var found = false
        var clusterid = ''
        var prevSimilarity = 0
        for(var i = 0; i < results.length; i++){
            var similarity = jw(hupc['CommandLine'],results[i]['CommandLine'])
            if(similarity > _threshold) {
                found = true;
                // we want the highest similarity
                if(similarity > prevSimilarity) {
                    clusterid = results[i]['@rid']
                    prevSimilarity = similarity
                }
            }
        }
        if(found){
            console.log('Create link from ' + hupc['@rid'] + ' to ' + clusterid)
            _session.command('CREATE EDGE SimilarTo FROM :h TO :c',
            { params : {h: hupc['@rid'], c: clusterid}})
            .on('data', (st)=>{
                console.log('Linked to existing cluster')
            })
        }
        else {
            console.log('Need to create new cluster for: ' + hupc['CommandLine'])
            newCluster(hupc)
        }
    })
}