const _dbName = 'wekan';
const _mongoURL = 'mongodb://wekan-db:27017';
const mongoClient = require('mongodb').MongoClient;
const sqrl = require("squirrelly");
const descriptionTemplate = require('./descriptionTemplates');
const responseTemplate = require('./responseTemplates');
const titleTemplate = require('./titleTemplates');
const moment = require('moment')

/**
 * Generic board class specific to DataFusion
 */
class Board {
    // can't use Promise within constructor, only assigning properties
    constructor() { 
        this.client = null;
        this.db = null;
        this.collection = null;
        this.document = null;
        this.lists = null;
    }
    
    get id(){
        if(this.document == null) return null
        return this.document._id;
    }
    /**
     * 
     * @param {string} title 
     */
    async init(title) {
        if(this.client == null) this.client = await mongoClient.connect(_mongoURL, { useNewUrlParser: true });
        this.db = this.client.db(_dbName);
        this.collection = this.db.collection('boards');
        this.document = await this.collection.findOne({'title':title}) // null if not found
        // when null, child-classes can carry on to create new board
        if(this.document == null) return Promise.resolve(null);
        this.lists = await this.db.collection('lists').find({'boardId':this.document._id}).toArray();        
        return Promise.resolve(this.document);
    }
 
    async upsertCard(_id, boardId, listId, title, description,customFields, sort = 0){
        var card = {}
        card["_id"] = _id
        card["boardId"] = boardId
        card["customFields"] = customFields
        card["type"] = "cardType-card"
        card["archived"] = false
        card["title"] = title
        card["listId"] = listId
        card["description"] = description
        card['sort'] = sort
        let c = await this.db.collection('cards').updateOne({'_id':_id},{$set: card},{upsert: true})
        return Promise.resolve(c);
    }

    async addLabel(labelStr,color ='yellow'){
        let _id = this.document._id + labelStr;
        this.document.labels.push({'_id':_id, 'name':labelStr,'color':color});
        await this.collection.replaceOne({'_id': this.document._id},this.document)
        return Promise.resolve(_id);
    }

    getListTitle(listId){
        let o = this.lists.find(function(l){ return l._id == listId});
        if(o) return Promise.resolve(o.title);
        return Promise.resolve();
    }
    
    getLabelId(name){
        let o = this.document['labels'].find(function(l) { return l.name == name });
        if(o) return Promise.resolve(o._id);
        return Promise.resolve(null);
    }

    async deleteCard(cardId){
        let r = await this.db.collection('cards').deleteOne({'_id':cardId});
        return Promise.resolve(r);
    }

    archive(){
        this.db.collection('boards').updateOne({'_id':this.document._id},{$set:{'archived':true}});
    }

    cleanup(){
        if(this.db.client) this.db.client.close();
    }
}

class TriageBoard extends Board {
    constructor() {
        super()
        this.checkListId = null;
        this.lists = null;
        this.caseActionId = null;
        this.caseActionsLookUp = {};
    }

    async init(){
        this.document = await super.init('Triage')
        let checkList = await this.collection.findOne({'title':'Checklists'});
        if(checkList == null) throw('Please import checklists board!');
        this.checkListId = checkList._id;
        let caseActions = await this.db.collection('customFields').findOne({'name':'Case Actions'});
        this.caseActionId = caseActions._id;
        caseActions.settings.dropdownItems.forEach(element => {
            this.caseActionsLookUp[element._id] = element.name;
        });
        console.log('Completed TriageBoard object initialisation!')
        return Promise.resolve(this.document);        
    }

    // data is a Case object from ODB live query (case is a keyword)
    async upsertCard(data){
        var customFields = []
        customFields.push({'_id':this.caseActionId, "value": null}); 
        let cardId = data['data']['@rid'].valueOf();
        let title = data['data']['Organisation'] + ' | ' + data['data']['Hostname'] + ' | Score: ' + data['data']['Score'];
        let listId = this.lists.find(function(l){ return l.title == 'Severity Level ' + data['data']['SeverityLevel']})._id        
        let card = await super.upsertCard(cardId,this.document._id,listId,title, '', customFields)
        return Promise.resolve(card);
    }

    updateCard(data, description, labelIds){
        var card = {}
        if(data['data'].hasOwnProperty('Created')) card["receivedAt"] = data['data']['Created']
        card["title"] = data['data']['Organisation'] + ' | ' +  data['data']['Hostname'] + ' | Score: ' + data['data']['Score']
        card["description"] = description
        card["labelIds"] = labelIds
        card["listId"] = this.lists.find(function(l){ return l.title == 'Severity Level ' + data['data']['SeverityLevel']})._id
        // higher score will go higher up the list
        card["sort"] = data['data']['State'] == 'closed'? 0 : -1*data['data']['Score'];
        this.db.collection('cards').updateOne({"_id":data['data']['@rid'].valueOf()},{$set:card})
    }

    async getCustomFieldValue(cardId){
        let card = await this.db.collection('cards').findOne({'_id':cardId});
        return Promise.resolve(this.caseActionsLookUp[card.customFields[0].value]);
    }

    async populateChecklist(cardId, alertType){
        //there is a corresponding Checklist:list named after alertType (eg. Rebooted), otherwise can't populate
        let checklist_id = cardId + alertType
        let existing = await this.db.collection('checklists').findOne({'_id':checklist_id})
        if(existing != null) return
        let alertTypelist = await this.db.collection('lists').findOne({'boardId':this.checkListId, 'title':alertType})
        if(alertTypelist == null) { console.log('Cannot find list for: ' + cardId + ':' + alertType); return; }
        let cards = await this.db.collection('cards').find({'listId':alertTypelist._id }).toArray();
        let checklist = {}
        checklist['cardId'] = cardId
        checklist['title'] = alertType
        checklist['sort'] = 0
        checklist['_id'] = checklist_id
        try {            
            await this.db.collection('checklists').updateOne({'_id':checklist['_id']},{$set: checklist},{upsert: true})
            let checklistItem = {}
            for(let i = 0; i < cards.length; i++) {
                checklistItem['_id'] = checklist['_id'] + cards[i].title
                checklistItem['title'] = '[' + cards[i].title + '](/b/' + this.checkListId + '/checklists/' + cards[i]._id + ')'
                checklistItem['sort'] = cards[i].sort
                checklistItem['cardId'] = checklist['cardId']
                checklistItem['checklistId'] = checklist['_id']
                await this.db.collection('checklistItems').updateOne({'_id':checklistItem['_id']},{$set: checklistItem},{upsert: true})
            }
         }
         catch(err){
            console.log(err)
         }
    }

    closeCard(cardId){
        this.db.collection('cards').updateOne({'_id':cardId},
                {$set:{'endAt': new Date(), 'sort':0, 'archived': true}
        });
    }

    async updateMembers(cardId, username){
        let card = await this.db.collection('cards').findOne({'_id':cardId});
        let user = await this.db.collection('users').findOne({'username':username});
        if(card.members == null) {
            console.log('no members, assigning...')
            var members = []
            members.push(user._id)
            this.db.collection('cards').updateOne({'_id':cardId},{$set:{'members': members}})
        } 
        else if(card.members.indexOf(user._id) < 0) { 
            card.members.push(user._id)
            this.db.collection('cards').updateOne({'_id':cardId},{$set:{'members': card.members}})
        }
        this.db.collection('cards').updateOne({'_id':cardId},{$set:{'startAt': new Date()}})
    }
}

class InvestigationBoard extends Board {
    constructor() {
        super()
        this.templateBoardname = 'Case Template';        
        this.webhook = null;
        this.eventActionId = null;
        this.eventActionsLookup = {};
    }

    /***
     * Cloning "Case Template" board to Case <caseId> board.
     */
    async init(caseId, hostName){
        let templateBoard = await super.init(this.templateBoardname);
        if(templateBoard == null) return Promise.reject(null);
        this.document = await this.collection.findOne({'_id':caseId});
        if(this.document !==null ) return Promise.resolve(this.document); 
        let templateLists = await this.db.collection('lists').find({'boardId': templateBoard._id}).toArray();
        let webhook = await this.db.collection('integrations').findOne({'boardId': templateBoard._id});
        if(webhook != null) {
            webhook._id = caseId;
            webhook.boardId = caseId;
            this.db.collection('integrations').updateOne({'_id':caseId},{$set:webhook},{upsert:true});
        }
        // populate custom field _id & lookup table
        let eventActions = await this.db.collection('customFields').findOne({'name':'Event Actions'})
        this.eventActionId = eventActions._id;
        eventActions.settings.dropdownItems.forEach(element => {
            this.eventActionsLookup[element._id] = element.name;
        });
        // link the custom field to the new board
        eventActions.boardIds.push(caseId);
        await this.db.collection('customFields').updateOne({'_id':eventActions._id},{$set:eventActions})
        templateBoard._id = caseId;
        templateLists.forEach(async list => {
            list._id = caseId + list.title;
            list.boardId = caseId;
            await this.db.collection('lists').updateOne({'_id':list._id},{$set:list},{upsert:true})
        });
        let title = templateBoard.title;
        templateBoard.title = title.replace('Template', caseId + ' - ' + hostName);
        templateBoard.slug = caseId;
        await this.db.collection('boards').updateOne({'_id':caseId},{$set:templateBoard},{upsert:true});
        this.document = await this.collection.findOne({'_id':caseId});
        this.lists = await this.db.collection('lists').find({'boardId':this.document._id}).toArray();
        return Promise.resolve(this.document);
    }

    /**
     * Loads the correct Wekan document before using other methods
     * Returns null if board is non-existent.
     * 
     * @param {string} caseId : Wekan boardId == OrientDB caseId
     */
    async load(caseId) {
        if(this.client == null) {
            this.client = await mongoClient.connect(_mongoURL, { useNewUrlParser: true });
            this.db = this.client.db(_dbName);
            console.log('initialised mongo client & db!')            
        }
        let eventActions = await this.db.collection('customFields').findOne({'name':'Event Actions'})
        this.eventActionId = eventActions._id;
        eventActions.settings.dropdownItems.forEach(element => {
            this.eventActionsLookup[element._id] = element.name;
        });
        this.collection = this.db.collection('boards');
        this.document = await this.collection.findOne({'_id':caseId});
        await this.db.collection('lists').find({'boardId':this.document._id}).toArray();
        return Promise.resolve(this.document);
    }

    getListName(event) {
        var listName = null
        switch(event['@class']) {
            case 'ProcessCreate':
            case 'DriverLoad':
            //case 'ImageLoad':    
                listName = 'Process Sequence';
                break;

            case 'NetworkConnect':
                // further check for DestinationType
                if(event.DestinationType == 'external') { listName = 'External Network Activities'; }
                else { listName = 'Internal Network Activities'; }
                break;

            default:
                listName = 'Process Activities';
                break;
        }
        return listName;
    }
    
    /**
     * 
     * @param {Object} event - OrientDB object containing Sysmon event
     */
    getTitleForEventType(event){
        event.SysmonClass = event['@class'];
        event.UtcTimeFormatted = moment(event.UtcTime).format();
        return sqrl.Render(titleTemplate.lookUp[event['@class']], {event: event});
    }    

    async upsertCard(event,caseId) {
        var customFields = []
        customFields.push({'_id':this.eventActionId, "value": null}); 
        if(event.hasOwnProperty('Hashes')) event.Hashes = event.Hashes.replace(',','\n\n')
        let listName = this.getListName(event);
        let cardId = event['@rid'].valueOf(); 
        let listId = caseId + listName;
        event['rid']= event['@rid'];
        let description = sqrl.Render(descriptionTemplate.lookUp[event['@class']], {event: event});   
        let title = this.getTitleForEventType(event);
        let card = await super.upsertCard(cardId, this.document._id,listId, title, description, customFields, event.id);
        return Promise.resolve(card)
    }

    /***
     * @param {string} caseId - case RID within OrientDB
     * @param {client.session} odb - OrientDB client session object 
     */
    async loadCaseProcessSequence(caseId, odb){
        let pc = await odb.query('select expand(R) from (select GetCaseProcessSequence(:rid) as R UNWIND R)',
                                {params:{rid:caseId}}).all();
        pc.forEach(async event => {
            await this.upsertCard(event,caseId)
            if(event['@class'] == 'ProcessCreate') {
                if(event.Sequence === undefined || event.ProcessType === undefined) {
                    console.log('created delayed check for ' + event['@rid'].valueOf() + ' @ ' + Date())
                    setTimeout(async function(odb,rid, _this){
                        let e = await odb.query('SELECT FROM ' + rid).all();
                        console.log('fetched again for: ' + event['@rid'].valueOf());
                        await _this.upsertCard(e[0],caseId)
                        await _this.upsertLabels(rid,odb)
                    },100000, odb, event['@rid'].valueOf(), this)
                } 
                if('out_AddedTo' in event) {
                    await this.upsertLabels(event['@rid'].valueOf(),odb);
                }
            }
            if(event['@class'] == 'ImageLoad' || event['@class'] == 'DriverLoad') {
                if('out_AddedTo' in event) {
                    await this.upsertLabels(event['@rid'].valueOf(),odb);
                }
            }
        });
        return Promise.resolve(true);
    }

    async upsertLabels(cardId, odb){
        let edges = await odb.query('select expand(R) from (select out_AddedTo as R from '+ cardId + ' UNWIND R)').all();
        let labelIds = [];        
        for(var i=0; i < edges.length;i++){
            if(!(edges[i]['reason'] in labelIds)) {
                let labelId = await this.getLabelId(edges[i]['reason'])
                labelIds.push(labelId)
            }
        }
        let card = await this.db.collection('cards').findOne({'_id':cardId});
        card['labelIds'] = labelIds
        return Promise.resolve(await this.db.collection('cards').updateOne({'_id':cardId},{$set:card}));
    }

    async handleCardSelected(cardId, odb){
        let card = await this.db.collection('cards').findOne({'_id':cardId});
        let filename = card.title.split('\\');
        filename = filename[filename.length - 1];
        await this.clearActivitiesList(card.boardId);
        await this.setListTitle(card.boardId+'Process Activities','<font size=2>Activities of ' + filename + '</font>');
        console.log('Linking events for ' + cardId)
        await odb.query("SELECT LinkNonProcessCreate("+cardId+")").all();
        console.log('Retrieving events for ' + cardId)
        let pc = await odb.query("select from (traverse out() from " + cardId + " maxdepth 1) \
                                  where (SourceName = 'Microsoft-Windows-Sysmon' OR SourceName = 'DataFusionProcMon') AND \
                                  @class <> 'ProcessCreate' order by id desc LIMIT 50").all();
        pc.forEach(async event => {
            await this.upsertCard(event,card.boardId);
            if('out_AddedTo' in event) {
                console.log('Fetching reasons labels for ' + event['@rid'].valueOf());
                await this.upsertLabels(event['@rid'].valueOf(),odb);
            }
        })
    }

    async getCustomFieldValue(cardId){
        let card = await this.db.collection('cards').findOne({'_id':cardId});
        return Promise.resolve(this.eventActionsLookup[card.customFields[0].value]);
    }

    async setListTitle(listId, title) {
        return Promise.resolve(await this.db.collection('lists').updateOne({'_id':listId},{$set:{'title':title}}))
    }

    async clearActivitiesList(boardId){        
        await this.db.collection('cards').deleteMany({'listId':boardId + 'Process Activities'})
        await this.db.collection('cards').deleteMany({'listId':boardId + 'External Network Activities'})
        await this.db.collection('cards').deleteMany({'listId':boardId + 'Internal Network Activities'})
        return Promise.resolve(true)
    }

    getKillProcessScript(pid){
        return sqrl.Render(responseTemplate.lookUp['killProcess'], {ProcessId: pid});
    }

    getDetectOnlyScript(action){ // action is either enableDetectOnly/disableDetectOnly
        return sqrl.Render(responseTemplate.lookUp[action],{});
    }
}

class OrganisationBoard extends Board {
    constructor() {
        super()
        this.profileList = null;
        this.detectList = null;
        this.lists = null;
        this.detectOnlyActionsId = null;
        this.detectOnlyActionsLookUp = {};
    }
    async init(){
        this.document = await super.init('Organisations');
        this.profileList = await this.db.collection('lists').findOne({'title': 'Profiling'})
        this.detectList = await this.db.collection('lists').findOne({'title': 'Detection'})
        // all 3 objects NEED to be initialised
        if(this.document == null || this.profileList == null || this.detectList == null) {
            return Promise.reject('Re-import Organisation Board!')
        }
        let detectOnlyActions = await this.db.collection('customFields').findOne({'name':'Configure DetectOnly'});
        this.detectOnlyActionsId = detectOnlyActions._id;
        detectOnlyActions.settings.dropdownItems.forEach(element => {
            this.detectOnlyActionsLookUp[element._id] = element.name;
        });
        return Promise.resolve(this.document);
    }
    
    getDetectOnlyScript(action){ // action is either enableDetectOnly/disableDetectOnly
        return sqrl.Render(responseTemplate.lookUp[action],{});
    }
    
    async getCustomFieldValue(cardId){
        let card = await this.db.collection('cards').findOne({'_id':cardId});
        return Promise.resolve(this.detectOnlyActionsLookUp[card.customFields[0].value]);
    }

    /***
     * @param {client.session} odb - OrientDB client session object 
     */
    async loadOrganisations(odb){
        //await this.db.collection('cards').deleteMany({'listId':this.profileList._id})
        //await this.db.collection('cards').deleteMany({'listId':this.detectList._id})
        let organisations = await odb.query("SELECT FROM Organisation").all();
        organisations.forEach( org => { this.upsertCard(org) })
    }
    /**
     * 
     * @param {Object} data - OrientDB object containing single Organisation
     */
    async upsertCard(data){
        var customFields = []
        customFields.push({'_id':this.detectOnlyActionsId, "value": null}); 
        let cardId = data['@rid'].valueOf();
        let title = data['Name'];
        let listId = null;
        if(data['ProfilingOrDetection'] == 1) {
            listId = this.profileList._id;
        }
        else {
            listId = this.detectList._id;
        }
        let description = ''
        if(data['DetectOnlyMode'] == true) {
            description = 'DetectOnlyMode: Enabled'
        }
        else {
            description = 'DetectOnlyMode: Disabled'
        }
        let card = await super.upsertCard(cardId,this.document._id,listId,title, description, customFields)
        return Promise.resolve(card);
    }

    async updateCard(data, odb){
        if(data['listId'] == this.profileList._id){
            console.log('update to org to profile mode...')
            odb.command('UPDATE ' + data['cardId'] + ' SET ProfilingOrDetection = 1')
        }
        else {
            console.log('update to org to detection mode...')
            odb.command('UPDATE ' + data['cardId'] + ' SET ProfilingOrDetection = 2')
        }
    }
}

module.exports = {
    Board, TriageBoard, InvestigationBoard, OrganisationBoard
}
