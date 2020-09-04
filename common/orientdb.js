require('dotenv').config()
require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l')

var _session = null, _client = null, _handle = null;
var _handles = []
var _exiting = false

async function startLiveQuery(statement, eventHandler){
    if(_session == null) await connectODB();
    console.log('session opened')
    _handle = await _session.liveQuery(statement).on("data", data => {
        eventHandler(data)
    })
    _handles.push(_handle)
    return Promise.resolve(_session);
}

function connectODB(){
    return new Promise( async(resolve, reject) => { 
        try {
            const OrientDBClient = require("orientjs").OrientDBClient
            _client = await OrientDBClient.connect({ host: process.env.ORIENTDB_HOST , port: process.env.ORIENTDB_PORT})
            _session = await _client.session({ name: process.env.ORIENTDB_NAME, username: process.env.ORIENTDB_USER, password: process.env.ORIENTDB_PASSWORD })
            resolve(_session)                     
        }
        catch(err) {
            reject(null)
        }
    });
}

async function closeDBsession(){
    if(_session){
        await _session.close()
        console.log('session closed');
        _session = null
        await _client.close()
        console.log('client closed');
        _client = null
        process.exit();
    }
}

// for Multi-Tenancy Profiling --- see Issue #37 
function readAllOrganistionsStatus(){    
    return new Promise( async(resolve, reject) => {        
        if(_session == null) reject("no session established");
        _orgStatus = {}
        var result = await _session.query('SELECT from Organisation').all();
        for(var i = 0; i < result.length; i++) {
            _orgStatus[result[i]['Name']] = result[i]['ProfilingOrDetection'] 
        }
        resolve(_orgStatus);
    })
}

function addOrganisation(orgName) {
    return new Promise( async(resolve, reject) => {
        if(_session == null) reject("no session established");
        var result = await _session.command('INSERT INTO Organisation SET Name = :o', { params : {o: orgName}}).all()
        resolve(result)
    })
}

function startMonitoringOrganisationStatus(orgStatus) {
    return new Promise( async(resolve, reject) => {
        if(_session == null) reject("no session established");
        handle = await _session.liveQuery('SELECT from Organisation').on("data", data => {
            if(data['data']['operation'] != 3){
                console.log('Updated ' + data['data']['Name']);
                orgStatus[data['data']['Name']] = data['data']['ProfilingOrDetection']
            }
            else {
                delete orgStatus[data['data']['Name']];
            }
        })
        _handles.push(handle)
        resolve();
    })
}

//process.stdin.resume(); //so the program will not close instantly

async function exitHandler(err) {
    if(_exiting) return;
    _exiting = true
    console.log('cleaning up...')    
    if(err != null) console.log(err)
    var i = 0, j = _handles.length
    console.log('No of handles: ' + j)
    while(_handles.length > 0) {
        console.log('Unsubscribed handle #' + i++)
        await _handles.shift().unsubscribe()
    }
    closeDBsession();
}

process.on('exit', exitHandler.bind(null));
process.on('SIGINT', exitHandler.bind(null));
process.on('SIGUSR1', exitHandler.bind(null));
process.on('SIGUSR2', exitHandler.bind(null));
process.on('uncaughtException', exitHandler.bind('uncaughtException'));

module.exports = { 
    connectODB, startLiveQuery, readAllOrganistionsStatus, addOrganisation,
    startMonitoringOrganisationStatus
}