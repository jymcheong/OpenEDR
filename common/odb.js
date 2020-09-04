require('dotenv').config()
require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l')

_odb = null

class Odb { 
    constructor(){        
        _odb = this; // exit handler bind has no visibility to "this"
        this.session = null, this.client = null;
        this.handle = null, this.handles = [];
        this.exiting = false;
        this.retrying = false;
        process.on('exit', this.cleanUp.bind(null));
        process.on('SIGINT', this.cleanUp.bind(null));
        process.on('SIGUSR1', this.cleanUp.bind(null));
        process.on('SIGUSR2', this.cleanUp.bind(null));
        process.on('uncaughtException', this.cleanUp.bind(null));
    }

    setReconnectedHandler(handler){
        var self = this;
        self.set = setInterval(async function(){
            try {
                if(self.session != null) {
                    await self.session.query("select 1").all()
                }
                else {
                    if(self.retrying) return;
                    console.log('reconnecting')                    
                    self.retrying = true
                    self.session = await self.startSession();
                    if(self.session != null) {
                        handler()
                        self.retrying = false
                    }
                }
            }
            catch(err){ 
                self.retrying = false               
                if(self.session != null) self.session = null
                if(err != null) console.log(err)
            }
        }, 5000)
    }

    startSession(){
        return new Promise( async(resolve, reject) => { 
            try {
                const OrientDBClient = require("orientjs").OrientDBClient
                this.client = await OrientDBClient.connect({ host: process.env.ORIENTDB_HOST , port: process.env.ORIENTDB_PORT})
                this.session = await this.client.session({ name: process.env.ORIENTDB_NAME, username: process.env.ORIENTDB_USER, password: process.env.ORIENTDB_PASSWORD })
                resolve(this.session)                     
            }
            catch(err) {
                reject(err)
            }
        });
    }

    async startLiveQuery(statement, eventHandler){
        if(this.session == null) await this.startSession();
        console.log('session opened')
        this.handle = await this.session.liveQuery(statement)
        .on("data", data => {
            eventHandler(data)
        })
        this.handles.push(this.handle)
        return Promise.resolve(this.session);
    }

    readAllOrganistionsStatus(){    
        return new Promise( async(resolve, reject) => {        
            if(this.session == null) reject("no session established");
            var orgStatus = {}
            var result = await this.session.query('SELECT from Organisation').all();
            for(var i = 0; i < result.length; i++) {
                orgStatus[result[i]['Name']] = result[i]['ProfilingOrDetection'] 
            }
            resolve(orgStatus);
        })
    }
    
    addOrganisation(orgName) {
        return new Promise( async(resolve, reject) => {
            if(this.session == null) reject("no session established");
            var result = await this.session.command('INSERT INTO Organisation SET Name = :o', { params : {o: orgName}}).all()
            resolve(result)
        })
    }

    startMonitoringOrganisationStatus(orgStatus) {
        return new Promise( async(resolve, reject) => {
            if(this.session == null) reject("no session established");
            var handle = await this.session.liveQuery('SELECT from Organisation').on("data", data => {
                if(data['data']['operation'] != 3){
                    console.log('Updated ' + data['data']['Name']);
                    orgStatus[data['data']['Name']] = data['data']['ProfilingOrDetection']
                }
                else {
                    delete orgStatus[data['data']['Name']];
                }
            })
            this.handles.push(handle)
            resolve();
        })
    }

    async closeDBsession(){
        if(this.session){
            await this.session.close()
            console.log('session closed');
            this.session = null
            await this.client.close()
            console.log('client closed');
            this.client = null
            console.log('cleaned up!');
            process.exit();
        }
    }

    // exit handler bind has no visibility to "this"
    async cleanUp(msg){   
        if(_odb.exiting) return;
        _odb.exiting = true  
        var i = 0, j = _odb.handles.length
        console.log('No of handles: ' + j) 
        while(_odb.handles.length > 0) {
            console.log('Unsubscribed handle #' + i++)
            await _odb.handles.shift().unsubscribe()
        }  
        _odb.closeDBsession();
    }
}
// non-OO way needs this to be updated whenever there's new functions
module.exports = { Odb }