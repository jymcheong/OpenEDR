import { request } from 'https';

/**
 * Retrieve metadata sub-analysis using the API.
 *
 * @function getAnalysis
 * @param {string} accessToken A valid API Access token
 * @param {string} id The analysis id.
 * @param {string} subId The sub-analysis id.
 * @returns {Promise<Object>} Metadata sub-analysis data.
 */

function getMetadata(accessToken, id, subId) {
  return new Promise((resolve, reject) => {
    if (!accessToken || typeof accessToken !== 'string')
      return reject(
        new Error('No Access Token provided ! Refer to documentation.')
      );

    if (!id || typeof id !== 'string')
      return reject(new Error('No analysis id ! Refer to documentation.'));

    if (!subId || typeof subId !== 'string')
      return reject(new Error('No sub-analysis id ! Refer to documentation.'));

    const options = {
      hostname: 'analyze.intezer.com',
      port: 443,
      path: `/api/v2-0/analyses/${id}/sub-analyses/${subId}/metadata`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const req = request(options, (res) => {
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

export { getMetadata };
