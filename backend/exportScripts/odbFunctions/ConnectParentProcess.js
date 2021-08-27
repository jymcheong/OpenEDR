//@type
d

//parameters


//name
ConnectParentProcess

//language
javascript

//code
return // no longer in use but keeping for reference

var db = orient.getDatabase();

var r = db.query('select from (select from pc where ToBeProcessed=true order by id asc limit 100) order by Hostname asc, RecordNumber asc')

function handleRetry(child_rid){
	print('set retry for ' + child_rid)
    try {
    	var c = db.command('UPDATE ? SET ParentRetry = ParentRetry + 1 RETURN AFTER ParentRetry', child_rid)
      	if(c[0].field('ParentRetry') > 0) { // this is deliberate
            retry("db.command('"+'UPDATE '+child_rid+' SET ToBeProcessed = false'+"')")
         	return true  // done retrying       	
      	}
      	else {
        	print('retried ' + c[0].field('ParentRetry'))
         	return false // for retrying
      	}	
    }
    catch(err) {
		var e = '' + err
        if(e.indexOf('UPDATE') > 0) {
        	print('Retrying connectParent for ' + child_rid)
            handleRetry(child_rid)
        }
        else {
        	print('handleRetry Failed: ' + e)
            db.command('INSERT INTO Errors Set Message = ?', e)
        }
    }
}

// used when retry complete still no parent
function recoverSeq(child) {
    var parentEXE = child.field('ParentImage').split('\\').reverse()[0];
    var childEXE = child.field('Image').split('\\').reverse()[0];
    var partialSeq = parentEXE + ' > ' + childEXE
    var seq = db.command('UPDATE seq SET Count = Count + 1 UPSERT RETURN AFTER @rid, Sequence, Count, Score \
						  WHERE Sequence like "%' + partialSeq + '"')
    if(seq[0].field('Sequence') == null) {
       print('Fail to recover sequence for ' + child.field('Image'))
       return true
    }
    if(seq.length == 0) return true
    
    print("recoverSeq|" + child.field('Hostname') + "|" + seq[0].field('Sequence'))
    var sql = 'UPDATE ' + child.field('@rid') + ' SET Sequence = "'+seq[0].field('Sequence')+'"'
    retry("db.command('" + sql + "')")
    var s = seq[0].field('Sequence')
    if(s == null) return false
    if(s.indexOf('services.exe > svchost.exe > wuauclt.exe > AM_') > 0) return true
    if(seq[0].field('Score') > 0 || seq[0].field('Count') == 1) {
        sql = 'CREATE EDGE SequenceSighted FROM ' + seq[0].field('@rid') + ' TO ' + child.field('@rid')
        retry("db.command('" + sql + "')")
        print('Sequence sighted in recoverSeq, linked '  + seq[0].field('@rid') + ' TO \
		' + child.field('@rid'))      
    }
	return true
}

function linkToParent(parentRID, childRID){
	retry("db.command('"+'CREATE EDGE ParentOf from '+parentRID+' TO '+childRID+"')")
	retry("db.command('"+'UPDATE '+childRID+' SET ToBeProcessed = false'+"')")
}

function connectParent(child) {	
    // this field is pre-populated by Microsoft_Windows_Sysmon pre-processing function
    if(child.field('ParentRID') != null){
    	linkToParent(child.field('ParentRID'),child.field('@rid'))
        return true
    }
    
    var parent = db.query('SELECT FROM ProcessCreate where Organisation = ? AND Hostname = ? AND \
	ProcessGuid = ?', child.field('Organisation'), child.field('Hostname'), child.field('ParentProcessGuid'))
    if(parent.length > 0) {
		parent = parent[0]
        if(parent.field('Sequence') == null) {
            if( handleRetry(child.field('@rid')) == false) return false
        }
        linkToParent(parent.field('@rid'),child.field('@rid'))
        return true   
    }
  	else {
       if(child.field('ProcessType') == 'Orphan') {
       		print('Found orphan @ ' + child.field('Hostname') + ' | ' + child.field('Image'))
            retry("db.command('"+'UPDATE '+child.field('@rid')+' SET ToBeProcessed = false'+"')")
            return true
       }
       else {
           if(handleRetry(child.field('@rid')) == false) return false    
           else return recoverSeq(child);
       }
    } 
}

try{
  for(var i = 0; i < r.length; i++){ 
      if(connectParent(r[i]) == false) break;
  }
}
catch(err) {
  var msg = 'ConnectParentProcess exception: ' + err 
  print(msg) 
  db.command('INSERT INTO Errors Set Message = ?', msg) 
}

