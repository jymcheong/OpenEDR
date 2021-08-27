import * as intezer from './intezerAPI/index.js';
import path from 'path';
import dotenv from 'dotenv'

dotenv.config()

// Provide an API Key in .env that was created by installcontainers.sh
const apiKey = process.env.INTEZER_APIKEY;

// Client
const client = new intezer.Client(apiKey);

const delay = (ms) => {
  return new Promise(resolve => {
      setTimeout(() => {
          resolve()
      }, ms)
  })
}

async function getAnalysis(analysis_id) {
  return new Promise((resolve, reject) => {
      client.analysis.getAnalysis(analysis_id)
      .then((data) => { resolve(data)})
      .catch(async (error) => {
         if(error[0]==202){
           resolve(202)
         }
         else reject(error)
      })
  })
}

// See https://www.notion.so/Unit-Test-Intezer-js-74b9613742b743e5ab0916d916389f5d

// ===========
// for a given sample, returns 'Trusted file' or a dictionary of various gene count & URL from Intezer API
// ===========
async function computeUniqueness(inFilePath){
  return new Promise(async(resolve, reject) => {
    try {         // zero out the counts
      var total = {'gene':0, 'common':0, 'unique':0, 'url':"https://analyze.intezer.com", 'family_name':''}       

      // this does the upload & enqueing into Intezer
      const url = await client.analyze(inFilePath);
      console.log(url)
      total['url'] += url

      // extract the analysis-id
      var aid = url.replace('/analyses/','')
      
      // 202 == queued, need to retry to wait for analysis completion
      // 409 Indicates that the current request is in conflict with the resource in Intezer Analyze. 
      // For example, when trying to create an analysis for a file that has already running analysis    
      while(await getAnalysis(aid) == 202) {
        console.log('waiting, sample in queue...')
        await delay(5000);
      }//*/
      
      var result = await client.analysis.getAnalysis(aid);
      total['verdict'] = result['verdict'];
      if(result['verdict'] == 'trusted') resolve('Trusted file');
      total['family_name'] = result['family_name']
      
      //*/
      var subanalysis = await client.analysis.getSubAnalyses(aid)
      for(var i=0; i < subanalysis.length; i++){
        await delay(3000);
        if('sub_analysis_id' in subanalysis[i]){
          console.log('sub_analysis_id: ' + subanalysis[i]['sub_analysis_id'])
          try {
            let codeReuse = await client.analysis.getCodeReuse(aid, subanalysis[i]['sub_analysis_id'])
            total['unique'] += codeReuse['unique_gene_count']
            total['common'] += codeReuse['common_gene_count']
            total['gene'] += codeReuse['gene_count']
            console.log(`unique gene count: ${codeReuse['unique_gene_count']}`);
            console.log(`common gene count: ${codeReuse['common_gene_count']}`);
            console.log(`gene count: ${codeReuse['gene_count']}`);
            console.log('total unique: ' + total['unique'])
            console.log('total gene: ' + total['gene'])
            console.log('total common: ' + total['common'])
          }
          catch(error){ console.error(error) }   
        }
      }
      resolve(total)
    }
    catch(error) { reject(error) }
  }) 
}

async function updateCapturedFile(odbSession, fileName, results){
  let basefilename = path.basename(fileName)
  const regex = /Org_.+_sample/i
  basefilename = basefilename.replace(regex,'sample')
  odbSession.command(`UPDATE CapturedFile MERGE ${JSON.stringify(results)} WHERE UploadedFileName = '${basefilename}'`).all()  
}

async function start(inFilePath, odbSession){
  return new Promise(async(resolve, reject) => {
    try { 
      let total = await computeUniqueness(inFilePath);
      updateCapturedFile(odbSession,inFilePath,total)
      resolve(total)
    }
    catch(err){
      reject(err)
    }
  })
}

export default start