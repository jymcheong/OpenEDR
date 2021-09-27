//@type
d

//parameters
r

//name
CheckForeign

//language
javascript

//code
// called by ProcessEvent to link UntrustedFile to ProcessCreate
try {
    var db = orient.getDatabase();
    var classname = r.field('@class')
    var pc_rid = r.field('@rid')

    var fullpath = classname == 'ProcessCreate' ? r.field('Image') : r.field('ImageLoaded');
    var foreign = db.query('SELECT * FROM UntrustedFile Where ToBeProcessed = true AND Type = ? AND \
                            Hostname = ? AND Organisation = ? AND ProcessGuid = ? AND FullPath = ?', 
                  classname, r.field('Hostname'), r.field('Organisation'), r.field('ProcessGuid'), fullpath);
    if(foreign.length == 0) return    

    var edgename = classname == 'ProcessCreate' ? "ExeSighted" : "DllSighted";
    retry("db.command('CREATE EDGE " + edgename + " FROM " + foreign[0].field('@rid') +" TO " + pc_rid + "')")
    retry("db.command('UPDATE " + foreign[0].field('@rid') +" SET ToBeProcessed = false')")
    print('Linked '+ edgename + ' from ' + foreign[0].field('@rid') + ' to ' + pc_rid)

      // use Image/ImageLoaded string to search last FileCreate 
    var searchFilename = r.field('ImageLoaded') ? r.field('ImageLoaded') : r.field('Image');
    findExecuteAfterWrite(searchFilename, r.field('Hostname'), r.field('Organisation'), pc_rid)
}
catch(err){
  var msg = 'CheckForeign: ' + err + ' | input: ' + r.field('@rid')
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "CheckForeign", Message = ?', msg)
}

