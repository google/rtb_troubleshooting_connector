/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Class for caching rows of data to Google Apps Script's Cache Service.
 */
class ApiRowCache {
  /**
   * https://developers.google.com/apps-script/reference/cache/cache-service#getusercache
   */
  constructor() {
    this.cache = CacheService.getUserCache();
  }

  /**
   * Caches rows of data retrieved from the supplied API endpoint using the
   * supplied filterSet.
   *
   * @param {!Object<string, *>} filterSet The filterSet used to retrieve the
   *     rows.
   * @param {string} endpoint The endpoint from which the rows were retrieved.
   * @param {!Array<!Object<string, *>>} apiRows The rows to cache.
   */
  putApiRows(filterSet, endpoint, apiRows) {
    const keyPrefix = `${filterSet.name}_${endpoint}`;
    const pairsToPut = {};

    // We create one key / value pair whose key is just the prefix and whose
    // value is how many apiRows we are caching. This allows us to retrieve the
    // pairs containing data without knowing in advance how many there are.
    pairsToPut[keyPrefix] = String(apiRows.length);
    for (const [index, apiRow] of apiRows.entries()) {
      pairsToPut[`${keyPrefix}_${index}`] = JSON.stringify(apiRow);
    }

    try {
      this.cache.putAll(pairsToPut, ApiRowCache.apiRowExpirationInSeconds_());
    } catch (error) {
      // Apps Script will return this error if any of the rows are too large to
      // be cached. If this happens, we simply return early without adding
      // anything to the cache.
      if (error.message === 'Argument too large: value') {
        return;
      } else {
        throw error;
      }
    }
  }

  /**
   * Retrieves rows of data for the supplied filterSet and endpoint if they are
   * present in the cache.
   *
   * @param {!Object<string, *>} filterSet The filterSet that would have been
   *     used to retrieve the rows.
   * @param {string} endpoint The endpoint from which the rows would have been
   *     retrieved.
   * @return {!Array<!Object<string, *>>|null} The cached rows, or null if the
   *     cache does not contain any rows for the supplied filterSet and endpoint.
   */
  getApiRows(filterSet, endpoint) {
    const keyPrefix = `${filterSet.name}_${endpoint}`;
    const numApiRows = +this.cache.get(keyPrefix);
    if (numApiRows === 0) {
      return null;
    }
    const indices = [...Array(numApiRows).keys()];

    const keysToGet = indices.map(function(index) {
      return `${filterSet.name}_${endpoint}_${index}`;
    });
    const pairsFromCache = this.cache.getAll(keysToGet);

    if (Object.keys(pairsFromCache).length !== numApiRows) {
      return null;
    }

    return indices.map(function(index) {
      return JSON.parse(
          pairsFromCache[`${filterSet.name}_${endpoint}_${index}`]);
    });
  }

  /**
   * Returns the amount of time in seconds for which cached apiRows would
   * ideally be kept. This is not guaranteed to be honored by Apps Script.
   *
   * @return {number} The amount of time in seconds.
   * @private
   */
  static apiRowExpirationInSeconds_() {
    return 21600;  // 6 hours, the maximum
  }
}
