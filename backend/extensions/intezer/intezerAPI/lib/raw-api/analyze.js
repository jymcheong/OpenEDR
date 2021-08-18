import FormData from 'form-data';
import { Readable } from 'stream';

/**
 * Post a file for analysis.
 *
 * @function analyze
 * @param {String} accessToken A valid API Access token. Use {@link module:Intezer.raw} to get one.
 * @param {ReadableStream} fileStream The file's buffer.
 * @param {String} [codeItemType] The type of the binary file uploaded, can be either 'file' or 'memory_module'. Default: `'file'`.
 * @param {Boolean} [disableDynamicExecution] Disable Intezer Analyze's Dynamic Execution process. Default: `false`
 * @param {Boolean} [disableStaticExtraction] Disable Intezer Analyze's Static Extraction process. Default: `false`
 * @returns {Promise<String>} Analysis URL.
 *
 * @see https://analyze.intezer.com/api/docs/documentation#post-analyze
 */

function analyze(
  accessToken,
  fileStream,
  codeItemType = 'file',
  disableDynamicExecution = false,
  disableStaticExtraction = false
) {
  return new Promise((resolve, reject) => {
    if (!accessToken || typeof accessToken !== 'string')
      return reject(
        new Error('No Access Token provided ! Refer to documentation.')
      );

    if (!fileStream || !(fileStream instanceof Readable))
      return reject(new Error('No file buffer ! Refer to documentation.'));

    const form = FormData();

    const options = {
      hostname: 'analyze.intezer.com',
      protocol: 'https:',
      port: 443,
      path: '/api/v2-0/analyze',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': form.getHeaders()['content-type'],
      },
    };

    form.append('file', fileStream);
    form.append('code_item_type', codeItemType.toString());
    form.append(
      'disable_dynamic_execution',
      disableDynamicExecution.toString()
    );
    form.append(
      'disable_static_extraction',
      disableStaticExtraction.toString()
    );

    form.submit(options, (err, res) => {
      let data = '';

      res.on('data', (d) => {
        data += d;
      });

      res.on('end', () => {
        // console.log(JSON.parse(data))
        if (res.statusCode === 201) return resolve(JSON.parse(data).result_url);
        reject([res.statusCode, JSON.parse(data)]); // Returns beautified error status
      });
    });
  });
}

export { analyze };
