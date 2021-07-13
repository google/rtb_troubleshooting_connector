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
 * A fake version of Google Apps Script's Cache class.
 *
 * https://developers.google.com/apps-script/reference/cache/cache
 */
class Cache {
  constructor() {
    this.cache = {};
  }

  /**
   * https://developers.google.com/apps-script/reference/cache/cache#putkey,-value,-expirationinseconds
   *
   * @param {string} key The keys to cache.
   * @param {string} value The value to cache.
   * @param {number} expirationInSeconds The requested expiration time. Ignored
   *     in this fake implementation.
   */
  put(key, value, expirationInSeconds) {
    this.cache[key] = value;
  }

  /**
   * https://developers.google.com/apps-script/reference/cache/cache#putallvalues
   *
   * @param {!Object<string, string>} values The keys and values to cache.
   * @param {number} expirationInSeconds The requested expiration time. Ignored
   *     in this fake implementation.
   */
  putAll(values, expirationInSeconds) {
    this.cache = {...this.cache, ...values};
  }

  /**
   * https://developers.google.com/apps-script/reference/cache/cache#getkey
   *
   * @param {string} key The key of the cached value.
   * @return {string} The cached value.
   */
  get(key) {
    return this.cache[key] || null;
  }

  /**
   * https://developers.google.com/apps-script/reference/cache/cache#getallkeys
   *
   * @param {!Array<string>} keys The keys to lookup.
   * @return {!Object<string, string>} The key/value pairs for all keys found in
   *     the cache.
   */
  getAll(keys) {
    const result = {};
    for (const key of Object.keys(this.cache)) {
      if (keys.includes(key)) {
        result[key] = this.cache[key];
      }
    }
    return result;
  }

  /**
   * https://developers.google.com/apps-script/reference/cache/cache#removekey
   *
   * @param {string} key The key to remove from the cache.
   */
  remove(key) {
    delete this.cache[key];
  }
}
