//@type
d

//parameters
r

//name
DriverLoad

//language
javascript

//code
try{
    var db = orient.getDatabase();

    var u = db.command('UPDATE ImageLoadedHashes set Count = Count + 1 \
                        UPSERT RETURN AFTER @rid, Count, BaseLined WHERE ImageLoaded = ? \
                        AND Hashes = ?', r.field('ImageLoaded'),r.field('Hashes'))
    // BasedLined means allowed (aka whitelisted)
    if(u[0].field('BaseLined') == true) return 

    print()
    print(Date() + "Sys First Sighting of " + r.field('ImageLoaded'))
    print()

    retry("db.command('CREATE EDGE SysSighted from "+u[0].field('@rid')+" TO "+r.field('@rid')+"')")

    db.command('CREATE EDGE UsedAsDriver FROM (SELECT FROM FileCreate WHERE Hostname = ? AND Organisation = ? AND TargetFilename.toLowerCase() = ? order by id desc limit 1) TO ? RETRY 10 WAIT 10',r.field('Hostname'),r.field('Organisation'),r.field('ImageLoaded').toLowerCase(),r.field('@rid'))

    retry("db.command('UPDATE " + r.field('@rid') + " SET ToBeProcessed = false')")

}
catch(err){
  var msg = 'DriverLoad: ' + err + ' | input: ' + r.field('@rid')
  print(msg) 
  db.command('INSERT INTO Errors Set Function = "DriverLoad", Message = ?', msg)
}

