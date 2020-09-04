/***
 * OrientDB live query track Case class changes & broadcast to all dashboard-clients
 */
const odb = new (require('../../common/odb').Odb)();
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8800 }); //port number needs to match dashboard.html
var session = null

async function writeCases() {
    var severity = {}
    // 1 as in Severity Level 1, ditto for the rest
    severity[1]= {'new': 0, "working": 0, "closed": 0}
    severity[2]= {'new': 0, "working": 0, "closed": 0}
    severity[3]= {'new': 0, "working": 0, "closed": 0}
    severity[4]= {'new': 0, "working": 0, "closed": 0}
    try {
        var records = await session.query('SELECT FROM Case WHERE NOT State = "archived"').all()
        if(records.length == 0) {
            var nocase = '{"1":{"new":0,"working":0,"closed":0},"2":{"new":0,"working":0,"closed":0},"3":{"new":0,"working":0,"closed":0},"4":{"new":0,"working":0,"closed":0}}'
            wss.broadcast(nocase)
            return
        }
        records.map(r => { severity[r['SeverityLevel']][r['State']]++ })    
        var stats = JSON.stringify(severity)
        wss.broadcast(stats)
    }
    catch(err){ // in case of wrong SeverityLevel &/or State
        console.error('' + err)
    }
}

function eventhandler(){
    writeCases()
}

// start OrientDB live query to track case changes
(async function start() {
    console.log('trying to connect')
    //session = await connectODB()
    session = await odb.startLiveQuery('select from case', eventhandler)
    writeCases()    
    console.log('DB connected, started Live Query')
    odb.setReconnectedHandler(async function(){
        console.log('re-establishing live query...')
        session = await odb.startLiveQuery('select from case', eventhandler);
    })
})();

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);c
    });
    console.log('client connected!')
    writeCases()
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
};
