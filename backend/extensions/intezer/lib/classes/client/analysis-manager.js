import * as raw from '../../raw-api/index.js';
import { Client } from './index.js';
import { Readable } from 'stream';

/**
 * @class AnalysisManager
 * @description That class manages a client's analysis requests.
 */

class AnalysisManager {
  /**
   * @property client
   * @description This manager's client
   * @type Client
   */
  client;

  /**
   * @method analyze
   * @description Analyze a file.
   * @param {Readable} file A file's Readable stream.
   * @param {String} [codeItemType] The type of the binary file uploaded, can be either 'file' or 'memory_module'. Default: `'file'`.
   * @param {Boolean} [disableDynamicExecution] Disable Intezer Analyze's Dynamic Execution process. Default: `false`
   * @param {Boolean} [disableStaticExtraction] Disable Intezer Analyze's Static Extraction process. Default: `false`
   * @returns {Promise<String>} The analysis' URL.
   */
  async analyze(file, ...options) {
    return raw.analyze(await this.client.token.get(), file, ...options);
  }

  /**
   * @method getFile
   * @description Retrieve a file's informations.
   * @param {String} fileHash The file's SHA256 or MD5 hash.
   * @returns {Promise<Object>} The analysis' results.
   */
  async getFile(fileHash) {
    return raw.getFile(await this.client.token.get(), fileHash);
  }

  /**
   * @method getAnalysis
   * @description Retrieve an analysis' informations.
   * @param {String} id The analysis' id.
   * @returns {Promise<Object>} The analysis' results.
   */
  async getAnalysis(id) {
    return raw.getAnalysis(await this.client.token.get(), id);
  }

  /**
   * @method getSubAnalyses
   * @description Retrieve an analysis' sub-analyses.
   * @param {String} id The analysis' id.
   * @returns {Array<Object>} The sub-analyses.
   */
  async getSubAnalyses(id) {
    return raw.getSubAnalyses(await this.client.token.get(), id);
  }

  /**
   * @method getMetadata
   * @description Retrieve a sub-analysis' metadata.
   * @param {String} id The analysis' id.
   * @param {String} subId The sub-analysis' id.
   * @returns {Promise<Object>} The sub-analysis' metadata.
   */
  async getMetadata(id, subId) {
    return raw.getMetadata(await this.client.token.get(), id, subId);
  }

  /**
   * @method getCodeReuse
   * @description Retrieve a sub-analysis' code reuse.
   * @param {String} id The analysis' id.
   * @param {String} subId The sub-analysis' id.
   * @returns {Promise<Object>} The sub-analysis' code reuse data.
   */
  async getCodeReuse(id, subId) {
    return raw.getCodeReuse(await this.client.token.get(), id, subId);
  }

  /**
   * @method getAccountRelatedSamples
   * @description Retrieve a sub-analysis' account related samples.
   * @param {String} id The analysis' id.
   * @param {String} subId The sub-analysis' id.
   * @returns {Promise<Object>} The sub-analysis' account related samples.
   */
  async getAccountRelatedSamples(id, subId) {
    return raw.getAccountRelatedSamples(
      await this.client.token.get(),
      id,
      subId
    );
  }

  constructor(client) {
    this.client = client;
  }
}

export { AnalysisManager };
