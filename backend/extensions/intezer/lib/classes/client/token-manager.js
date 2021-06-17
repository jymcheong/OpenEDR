import * as raw from '../../raw-api/index.js';

/**
 * @function hoursToMs
 * @description Converts hours into miliseconds.
 */

function hoursToMs(hour) {
  return hour * 1000 * 60 * 60;
}

/**
 * @class Intezer TokenManager
 * @description That class manages a Client's access tokens and API Key.
 */

class TokenManager {
  /**
   * @property apiKey
   * @type {String}
   * @description The API Key.
   */
  apiKey;

  /**
   * @property currentToken
   * @type {String}
   * @description The current Access Token.
   */
  currentToken;

  /**
   * @property lastRefreshTime
   * @type {Number}
   * @description The last time the token has been refreshed.
   */
  lastRefreshTime;

  /**
   * @property tokenLifeSpan
   * @type {Number}
   * @description Access token's lifespan in hours.
   * @default 10 - An Access token is valid 10 hours on the API's side.
   *
   */
  tokenLifeSpan = 10;

  /**
   * @method isTokenValid
   * @description Calculates if the access token has expired.
   * @returns {Boolean}
   */
  isExpired() {
    return this.lastRefreshTime != null
      ? this.lastRefreshTime + hoursToMs(this.tokenLifeSpan) < Date.now() - 5
      : true; //
  }

  /**
   * @method get
   * @returns {Promise<String>}
   * @description Gets a valid Access token.
   */
  async get() {
    if (!this.isExpired()) return this.currentToken;
    return await this.refresh();
  }

  /**
   * @method
   * @description Refreshs the access token.
   * @returns {Promise<String>} New Access Token.
   */

  async refresh() {
    try {
      this.currentToken = await raw.getAccessToken(this.apiKey);
      this.lastRefreshTime = Date.now();
      return this.currentToken;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @constructor
   * @param {String} apiKey The client's apiKey.
   * @param {Object} [options] This manager's options.
   */
  constructor(apiKey, options) {
    if (!apiKey || typeof apiKey !== 'string')
      throw 'No API Key provided ! Refer to documentation.';
    this.apiKey = apiKey;

    if (options) {
      this.lifeSpan = options['lifeSpan'] ?? 10; // Apply optionnal lifespan or default.
    }

    this.refresh(); // Get first token
  }
}

export { TokenManager };
