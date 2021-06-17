import https from 'https';

/**
 * Retrieve a file's information from the API.
 *
 * @function getFile
 * @param {string} accessToken A valid API Access token. Use {@link module:Intezer.raw} to get one.
 * @param {string} fileHash The file's SHA256, SHA1 or MD5 hash.
 * @returns {Promise<Object>} File data.
 */

function getFile(accessToken, fileHash) {
  return new Promise((resolve, reject) => {
    if (!accessToken || typeof accessToken !== 'string')
      return reject(
        new Error('No Access Token provided ! Refer to documentation.')
      );

    if (!fileHash || typeof fileHash !== 'string')
      return reject(new Error('No file hash ! Refer to documentation.'));

    const options = {
      hostname: 'analyze.intezer.com',
      port: 443,
      path: `/api/v2-0/files/${fileHash}`,
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

export { getFile };
