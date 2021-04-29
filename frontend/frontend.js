/***
 * The middleware between ODB & Wekan, 
 * mitigating risks of UI flaws that could directly access/manipulate event-database 
 */
require('dotenv').config()
const odb = new (require('../common/odb').Odb)();
const wekanBoards = require('./common/wekanBoards');

var g_ODBsession = null
var g_TriageBoard = null
var g_InvestigationBoard = null
var g_OrganisationBoard = null

// Note that cardId == Case @rid in ODB
// Description of case is a series of Timestamp + reason-text 
// The 'reason' explains why the alerted event was added to a case. 
// There are existing labels in the board that matches the 'reasons' used in ODB side
async function getDescriptionsLabels(cardId, rid_array) {
    return new Promise(async function(resolve, reject) {
        let escapeCardId = require('querystring').escape(cardId);
        var description = '[CLICK to Review Case Board](/b/' + escapeCardId + '/'+ escapeCardId + ')\n\n\n'
        var labels = []
        if(rid_array.length === undefined) return null
        if(rid_array.length == 0) return null
        for(rid of rid_array) {
            let result = await g_ODBsession.query("SELECT FROM " + rid.valueOf()).all()
            if(!("reason" in result[0])) continue
            var timestamp = new Date(result[0]['Created'].toString().split('GMT')[0]+' UTC').toISOString().toString().replace('.000Z','').replace('T',' ')
            description += (timestamp + ' - ' + result[0]['reason'] + '\n')
            if(!(result[0]['reason'] in labels)){
                let labelId = await g_TriageBoard.getLabelId(result[0]['reason'])
                if(labelId == null) labelId = g_TriageBoard.addLabel(result[0]['reason']);
                if(labelId.length >0) labels.push(labelId)            
                g_TriageBoard.populateChecklist(cardId, result[0]['reason'])
            }
        }
        resolve([description,labels]);
    });
}

// adds a Case card
async function addCase(data) {
    await g_TriageBoard.upsertCard(data);        
    return Promise.resolve(await g_InvestigationBoard.init(data['data']['@rid'].valueOf(), data['data']['Organisation'] + ' | ' + data['data']['Hostname']))
}

// udpates a Case card
async function updateCase(data) {
    try{
        await addCase(data)
        var description = await getDescriptionsLabels(data['data']['@rid'].valueOf(), data['data']['in_AddedTo'])
        if(description == null) return
        g_TriageBoard.updateCard(data,description[0],description[1])
        await g_InvestigationBoard.load(data['data']['@rid'].valueOf())
        g_InvestigationBoard.setListTitle(data['data']['@rid'].valueOf()+'Process Activities','Process Activities');
        return Promise.resolve(await g_InvestigationBoard.loadCaseProcessSequence(data['data']['@rid'].valueOf(),g_ODBsession))
    }
    catch(err) {
        console.log(err)
    }
}

async function handleNewCase(data){
    if(data['operation'] == 1) {
        console.log('created card_id ' + data['data']['@rid'].valueOf())
        await addCase(data)
    }
    if(data['operation'] == 2) {
        console.log(data['data']['@rid'].valueOf() + ' changed');
        if(data['data']['State']=='closed') return;
        setTimeout(function(data){ updateCase(data) },500,data) 
    }
}

(async function start() {
    try {
        g_OrganisationBoard = new wekanBoards.OrganisationBoard()
        if(await g_OrganisationBoard.init() == null) throw('Please check Organisation board')
        g_TriageBoard = new wekanBoards.TriageBoard()
        if(await g_TriageBoard.init() == null) throw('Triage board not found')
        console.log('triageBoard initialized!');
        g_InvestigationBoard = new wekanBoards.InvestigationBoard();
    }
    catch(err) {
        console.log(err)
        process.exit();
    }
    console.log('Connecting to ODB...')    
    g_ODBsession = await odb.startLiveQuery('select from case', handleNewCase)
    g_OrganisationBoard.loadOrganisations(g_ODBsession);
    console.log('Connected to ODB!')
    //setInterval(function(){ g_OrganisationBoard.loadOrganisations(g_ODBsession); }, 3000);
    odb.setReconnectedHandler(async function(){
        console.log('re-establishing live query...')
        g_ODBsession = await odb.startLiveQuery('select from case', handleNewCase);
    })
    await odb.startLiveQuery('select from Organisation', function(data){ 
        if(data['operation'] == 1)
            g_OrganisationBoard.loadOrganisations(g_ODBsession); 
        })
})();

// handles CaseAction-customField changes
async function updateCaseState(hookEvent) {
    var state = null
    switch(await g_TriageBoard.getCustomFieldValue(hookEvent['cardId'])) {
        case 'Investigate':
            state = 'working'
            g_TriageBoard.updateMembers(hookEvent['cardId'],hookEvent['user'])         
            break;
        case 'Close':
            state = 'closed'
            g_TriageBoard.closeCard(hookEvent['cardId']);
            break
    }
    if(state != null) await g_ODBsession.command('update ' + hookEvent['cardId'] + ' set State = "' + state + '"')
}

/***
 * event is a Sysmon ProcessCreate
 */
async function killProcess(event){
    if(event['@class'] != 'ProcessCreate') return;
    var r = {}
    r['Type'] = 'scripting'
    r['Organisation'] = event['Organisation']
    r['Hostname'] = event['Hostname']
    r['Payload'] = g_InvestigationBoard.getKillProcessScript(event['ProcessId'])
    g_ODBsession.command('INSERT INTO ResponseRequest CONTENT ' + JSON.stringify(r))
}

function handleDetectOnly(action, event) {
    var r = {}
    r['Type'] = 'scripting'
    r['Organisation'] = event['Organisation']
    if('Hostname' in event) {
        r['Hostname'] = event['Hostname']
        r['Payload'] = g_InvestigationBoard.getDetectOnlyScript(action)
    }
    else {
        r['Payload'] = g_OrganisationBoard.getDetectOnlyScript(action)
    }
    g_ODBsession.command('INSERT INTO ResponseRequest CONTENT ' + JSON.stringify(r))
}

function whitelistProcess(odb,rid) {
    whitelistCommandLine(odb,rid);
    whitelistSequence(odb,rid);
}

function whitelistCommandLine(odb,rid) {
    odb.query('select WhitelistCommandLine("' + rid + '")')
}

function whitelistSequence(odb,rid){
    odb.query('select WhitelistSequence("' + rid + '")')
}

function whitelistDriverLoad(odb,rid){
    odb.query('select WhitelistDriverLoad("' + rid + '")')
}

async function handleOrganisationBoardCustomFieldChange(hookEvent, odb){
    let option = await g_OrganisationBoard.getCustomFieldValue(hookEvent['cardId'])
    let event = {}
    event['Organisation'] = hookEvent['card']
    console.log(option)
    switch(option){
        case 'Disable DetectOnly':
            handleDetectOnly('disableDetectOnly',event);
            await g_ODBsession.command('UPDATE ' + hookEvent['cardId'] + ' SET DetectOnlyMode = false')
            break;
        case 'Enable DetectOnly':
            handleDetectOnly('enableDetectOnly',event);
            await g_ODBsession.command('UPDATE ' + hookEvent['cardId'] + ' SET DetectOnlyMode = true')
            break;
    }
    g_OrganisationBoard.loadOrganisations(odb);
}

async function handleInvestigationBoardCustomFieldChange(hookEvent, odb){
    let option = await g_InvestigationBoard.getCustomFieldValue(hookEvent['cardId'])
    let event = await odb.query('select from ' + hookEvent['cardId']).all();
    if(event.length == 0) {
        console.log('Event not found for ' + option);
        return;
    }
    //if(option == 'Kill Process') killProcess(event[0]);
    switch(option){
        case 'Kill Process':
            killProcess(event[0]);
            break;
        case 'Whitelist Process':
            whitelistProcess(odb,event[0]['@rid']);
            break;
        case 'Whitelist CommandLine':
            whitelistCommandLine(odb,event[0]['@rid']);
            break;
        case 'Whitelist Process Sequence':
            whitelistSequence(odb,event[0]['@rid']);
            break;
        case 'Whitelist Driver':
            whitelistDriverLoad(odb,event[0]['@rid']);
            break;
        case 'Disable DetectOnly':
            handleDetectOnly('disableDetectOnly',event[0]);
            break;
        case 'Enable DetectOnly':
            handleDetectOnly('enableDetectOnly',event[0]);
            break;
    }
}

// webhook listener
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true,}));
app.post('/webhook', async (req, res) => {
    res.send('OK');
    const hookEvent = req.body;
    switch(hookEvent['description']){
        case 'act-setCustomField':
            console.log('Custom field changed') 
            // 2 types of customField, 1 from TriageBoard, the other investigation boards
            if(g_InvestigationBoard == null) {
                await g_InvestigationBoard.load(hookEvent['boardId'])
            }

            if(hookEvent['boardId'] == g_TriageBoard.id) {
                console.log('Triage Board custom field changed!')
                setTimeout(function(){ updateCaseState(hookEvent); }, 500);
            }
            
            if(hookEvent['boardId'] == g_InvestigationBoard.id) {
                // this delay is needed as mongoDB may take a while to update after UI changes
                setTimeout(function(){ handleInvestigationBoardCustomFieldChange(hookEvent,g_ODBsession); }, 500);
            }

            if(hookEvent['boardId'] == g_OrganisationBoard.id) {       
                console.log("calling handleOrganisationBoardCustomFieldChange")         
                setTimeout(function(){ handleOrganisationBoardCustomFieldChange(hookEvent,g_ODBsession) }, 500);
            }

            break

        case 'act-moveCard':
            if(hookEvent['boardId'] == g_TriageBoard.id) {
                var level = await g_TriageBoard.getListTitle(hookEvent['listId']);
                console.log('Severity Level changed to ' + level)
                var sql = 'update ' + hookEvent['cardId'] + ' set SeverityLevel = ' + level.replace('Severity Level ', '')
                g_ODBsession.command(sql)
            }
            if(hookEvent['boardId'] == g_OrganisationBoard.id){
                g_OrganisationBoard.updateCard(hookEvent,g_ODBsession)
            }
            break
        
        case 'CardSelected':
            console.log('Card selected ' + hookEvent.cardId);            
            // only respond to "Process Sequence" list of "Case Board" for now
            if(hookEvent.listId.indexOf('Process Sequence') > 0) {
                console.log('calling Investigation board card selected handler')
                await g_InvestigationBoard.load(hookEvent.boardId);
                g_InvestigationBoard.handleCardSelected(hookEvent.cardId,g_ODBsession);
            }
            break;
    }
  });
  
const portToListenOn = 3800;
app.listen(portToListenOn, () => {
    console.log(`Listening for Wekan webhook event data on port ${portToListenOn}. Started ${new Date().toString()}`);
});