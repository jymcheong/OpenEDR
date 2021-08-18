import { sha256 } from 'js-sha256';
import { createReadStream, readFileSync } from 'fs';
import { Readable } from 'stream';
import { TokenManager } from './token-manager.js';
import { AnalysisManager } from './analysis-manager.js';

/**
 * @class Client
 * @description Intezer API Client
 */

class Client {
  /**
   * @property token
   * @description The client's token manager.
   * @type TokenManager
   */

  token;

  /**
   * @property analysis
   * @description The client's analysis manager.
   * @type AnalysisManager
   */

  analysis;

  /**
   * @method hash Hash a given string using SHA-256.
   * @param {String} str The string to hash.
   * @returns {String} The string's hash.
   */
  static hash(str) {
    return sha256(str);
  }

  /**
   * @method hashFile Hash a file using SHA-256.
   * @param {String} filePath The path to the file to hash.
   * @returns {String} The file's hash.
   */
  static hashFile(filePath) {
    return this.hash(readFileSync(filePath));
  }

  /**
   * @method analyze A shortcut for `Client.analysis.analyze()` but that will convert a file's path to a readable stream beforehand.
   * @param {String/Readable} file The file's path or Reable stream.
   * @param  {...any} options
   * @returns {Promise<String>} The analysis' URL.
   */
  async analyze(file, ...options) {
    if (!(file instanceof Readable) && typeof file == 'string')
      file = createReadStream(file);

    return this.analysis.analyze(file, ...options);
  }

  /**
   * @constructor
   * @param {String} apiKey An Intezer's API Key.
   */
  constructor(apiKey, options) {
    this.token = new TokenManager(apiKey, options?.token);
    this.analysis = new AnalysisManager(this);
  }
}

export { Client };
