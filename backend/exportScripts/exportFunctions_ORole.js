/***
 * This script exports all functions into functions.json
 * 
 * Import command with ODB console: 
 *     import database functions.json -merge=true
 */

const fs = require("fs")
const connectODB = require('../../common/orientdb').connectODB;

// official EXPORT DATABASE for functions IS VERY SLOW!
async function exportFunctions(){
    _session = await connectODB()
    var output = '{"records":[';
    let results = await _session.query("select @this.toJSON() from OFunction").all();
    for(var i = 0; i < results.length; i++) {
        output += results[i]['@this.toJSON()'] + ','
    }

    let results2 = await _session.query("select @this.toJSON() from ORole").all();
    for(var i = 0; i < results2.length; i++) {
        output += results2[i]['@this.toJSON()'] + ','
    }
    
    let results3 = await _session.query("select @this.toJSON() from OUser").all();
    for(var i = 0; i < results3.length; i++) {
        output += results3[i]['@this.toJSON()'] + ','
    }
    output = output.slice(0,-1) + "]}"
    //console.log(output)
    fs.writeFile('functions.json', output, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
        process.exit();
    }); 
}

exportFunctions();

