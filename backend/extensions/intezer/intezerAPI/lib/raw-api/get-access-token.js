import https from 'https';

/**
 * Retrieve an analysis using the API.
 *
 * @function getAccessToken
 * @param {String} apiKey An Intezer's API Key.
 * @returns {Promise<String>} Access token.
 *
 * @see https://analyze.intezer.com/account-details
 */

function getAccessToken(apiKey) {
  return new Promise((resolve, reject) => {
    if (!apiKey || typeof apiKey !== 'string')
      return reject(new Error('No API Key provided ! Refer to documentation.'));

    const data = JSON.stringify({
      api_key: apiKey,
    });

    const options = {
      hostname: 'analyze.intezer.com',
      port: 443,
      path: '/api/v2-0/get-access-token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
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

    req.write(data);

    req.end();
  });
}

export { getAccessToken };
