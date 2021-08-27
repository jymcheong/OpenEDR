const fs = require('fs');

/**
 * Pre-process message to extract fields from 4688 & 4689 Message fields.
 * Note that Nxlog is not extracting the fields & ODB-AddEvent function removes Message field due to data-deduplication
 * 
 * @param {string} msg JSON event message
 * @returns 
 */
async function preProcess(msg) {
    return new Promise((resolve, reject) => {
      try{
        let event = JSON.parse(msg)
        // Windows audit event 4688 & 4689 are generated ahead of respective Sysmon events
        if((event.EventID == 4688 || event.EventID == 4689) && event.Channel == 'Security') {          
          let msg468X = event.Message.split('\r\n')
          for(var i=3; i< msg468X.length; i++) {            
            let match468X = msg468X[i].match(/\t(.+)\:\t+(.+)/mi)
            if(match468X == null) continue;
            if(match468X.length == 3) {                
                let key = match468X[1].replaceAll(' ','')
                // need to de-duplicate, otherwise ODB insert will fail
                if(key in event) continue
                event[key] = match468X[2]
            }
          }
          if(event.EventID == 4688){
            let parentPID = event.Message.match(/\s+Creator Process ID\:\s+(.+)\s+/mi)
            if(parentPID.length > 1) event.PPID = parseInt(parentPID[1])
            
            let NewPID = event.Message.match(/\s+New Process ID\:\s+(.+)\s+/mi)
            if(NewPID.length > 1) event.PID = parseInt(NewPID[1]) 
          }
          if(event.EventID == 4689){
            let PID = event.Message.match(/\s+Process ID\:\s+(.+)\s+/mi)
            if(PID.length > 1) event.PID = parseInt(PID[1])
          }
        }
        // we added new fields to json object, need to return stringify
        //console.log(JSON.stringify(event))
        msg = JSON.stringify(event)
        resolve(msg)
      }  
      catch(error){
        reject(error)
      }
    })
}

try {
    // read contents of the file
    const data = fs.readFileSync('backend/test/4688sample.json', 'UTF-8');

    // split the contents by new line
    const lines = data.split(/\r?\n/);

    // simulate https://github.com/jymcheong/OpenEDR/blob/master/backend/insertEvent.js#L73
    lines.forEach(async (line) => {
      if(line.length > 0) line = await preProcess(line)
    });
} catch (err) {
    console.error(err);
}