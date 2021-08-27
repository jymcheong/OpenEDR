/***
 * This script exports every ODB server-side function into individual JavaScript file    
 * It is executed by export.sh
***/

const { dir } = require("console");
const fs = require("fs")
const odb = new (require('../../common/odb').Odb)();
const fields = ["parameters","name","language","code"]

async function exportFunctions(){
    _session = await odb.startSession()
    if(_session !== null) { // only nuke files if we get a ODB session
        let dirPath = '/openedrserver/backend/exportScripts/odbFunctions'
        try { var files = fs.readdirSync(dirPath); }
        catch(e) { return; }
        if (files.length > 0)
            for (var i = 0; i < files.length; i++) {
                var filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile()) fs.unlinkSync(filePath);
            }
    }
    var output = '{"records":[';
    let results = await _session.query("select @this.toJSON() from OFunction").all();
    for(var i = 0; i < results.length; i++) {
        var line = JSON.parse(results[i]['@this.toJSON()']);
        delete line["@rid"]
        var output = '//@type\n'
        output += line["@type"]+'\n\n'
        for(var k = 0; k < fields.length; k++) {
            output += '//'+fields[k]+'\n'
            output += line[fields[k]]+'\n\n'
        }
        fs.writeFile('odbFunctions//' + line['name']+'.js', output, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
            process.exit();
        });
    }
}
exportFunctions();