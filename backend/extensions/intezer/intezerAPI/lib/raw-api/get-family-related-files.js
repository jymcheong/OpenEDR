import https from 'https';

/**
 * Retrieve code-reuse sub-analysis family related files using the API.
 *
 * @function getAnalysis
 * @param {String} accessToken A valid API Access token
 * @param {String} id The analysis id.
 * @param {String} subId The sub-analysis id.
 * @param {String} familyId The code family id.
 * @returns {Promise<Object>} Code-Reuse sub-analysis data.
 */

function getFamilyRelatedFiles(accessToken, id, subId, familyId) {
  return new Promise((resolve, reject) => {
    if (!accessToken || typeof accessToken !== 'string')
      return reject(
        new Error('No Access Token provided ! Refer to documentation.')
      );

    if (!id || typeof id !== 'string')
      return reject(new Error('No analysis id ! Refer to documentation.'));

    if (!subId || typeof subId !== 'string')
      return reject(new Error('No sub-analysis id ! Refer to documentation.'));

    if (!familyId || typeof familyId !== 'string')
      return reject(new Error('No code family id ! Refer to documentation.'));

    const options = {
      hostname: 'analyze.intezer.com',
      port: 443,
      path: `/api/v2-0/analyses/${id}/sub-analyses/${subId}/code-reuse/families/${familyId}/find-related-files`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (d) => {
        data += d;
      });

      res.on('end', () => {
        if (res.statusCode === 200) return resolve(JSON.parse(data));
        reject([res.statusCode, JSON.parse(data)]); // Returns beautified error status
      });
    });

    req.on('error', (error) => {
      return reject(error);
    });

    req.end();
  });
}

export { getFamilyRelatedFiles };
