import https from 'https';

/**
 * Retrieve an analysis using the API.
 *
 * @function getAnalysis
 * @param {string} accessToken A valid API Access token. Use {@link module:Intezer.raw.getAccessToken} to get one.
 * @param {string} id The analysis id.
 * @returns {Promise<Object>} Analysis data.
 */

function getAnalysis(accessToken, id) {
  return new Promise((resolve, reject) => {
    if (!accessToken || typeof accessToken !== 'string')
      return reject(
        new Error('No Access Token provided ! Refer to documentation.')
      );

    if (!id || typeof id !== 'string')
      return reject(new Error('No analysis id ! Refer to documentation.'));

    const options = {
      hostname: 'analyze.intezer.com',
      port: 443,
      path: `/api/v2-0/analyses/${id}`,
      method: 'GET',
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
        if (res.statusCode === 200) return resolve(JSON.parse(data).result);
        reject([res.statusCode, JSON.parse(data)]); // Returns beautified error status
      });
    });

    req.on('error', (error) => {
      return reject(error);
    });

    req.end();
  });
}

export { getAnalysis };
