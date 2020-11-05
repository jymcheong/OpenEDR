/***
 * This script exports all functions into functions.json
 * 
 * Import command with ODB console: 
 *     import database functions.json -merge=true
 */

const fs = require("fs")
const connectODB = require('../../common/orientdb').connectODB;

async function exportFunctions(){
    _session = await connectODB()
    var output = '{"records":[';
    let results = await _session.query("select @this.toJSON() from OFunction").all();
    for(var i = 0; i < results.length; i++) {
        var line = JSON.parse(results[i]['@this.toJSON()']);
        delete line["@rid"]
        output += JSON.stringify(line) + ','
    }

    output = output.slice(0,-1) + "]}"
    //console.log(output)
    fs.writeFile('functionsONLY.json', output, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
        process.exit();
    }); 
}

exportFunctions();

