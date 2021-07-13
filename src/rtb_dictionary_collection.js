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
 * Class for retrieving and parsing RTB dictionaries the connector needs.
 *
 * https://developers.google.com/authorized-buyers/rtb/data#dictionaries
 *
 */
class RtbDictionaryCollection {
  /** https://developers.google.com/apps-script/reference/cache/cache */
  constructor() {
    this.cache = CacheService.getScriptCache();
  }

  /**
   * Returns a collection of parsed RTB dictionaries keyed by the name of the
   * source file.
   *
   * @return {!Object<string, !Object<string, string>>} A collection of RTB
   *     dictionaries.
   */
  getRtbDictionaries() {
    const result = {};
    for (const filename of RtbDictionaryCollection.filenames_()) {
      let rtbDictionary = JSON.parse(this.cache.get(filename));
      if (!rtbDictionary) {
        rtbDictionary =
            RtbDictionaryCollection.getFreshRtbDictionary_(filename);
        this.cache.put(filename, JSON.stringify(rtbDictionary),
                       RtbDictionaryCollection.cacheExpirationInSeconds_());
      }
      result[filename] = rtbDictionary;
    }
    return result;
  }

  /**
   * Fetches and parses the current version of the RTB dictionary corresponding
   * to the supplied filename.
   *
   * @param {string} filename The filename for the RTB dictionary.
   * @return {!Object<string, string>} The parsed RTB dictionary.
   * @private
   */
  static getFreshRtbDictionary_(filename) {
    const url = RtbDictionaryCollection.rtbDictionaryBaseUrl_() + filename;
    const options = {muteHttpExceptions: false};
    const response = UrlFetchApp.fetch(url, options);
    const contentText = response.getContentText();

    const result = {};
    for (const line of contentText.split('\n')) {
      const lineParts = line.split(' ');
      result[lineParts[0]] = lineParts.slice(1).join(' ');
    }
    return result;
  }

  /**
   * The base URL where RTB dictionary files are posted in the public docs.
   *
   * @return {string} The base URL.
   * @private
   */
  static rtbDictionaryBaseUrl_() {
    return 'https://storage.googleapis.com/adx-rtb-dictionaries/';
  }

  /**
   * Returns the amount of time in seconds for which a cached
   * RtbDictionaryCollection would ideally be kept. This is not guaranteed to be
   * honored by Apps Script.
   *
   * https://developers.google.com/apps-script/reference/cache/cache#putkey,-value,-expirationinseconds
   *
   * @return {number} The amount of time in seconds.
   * @private
   */
  static cacheExpirationInSeconds_() {
    // 6 hours. This is the maximum cache expiration that Apps Script allows you
    // to request.
    return 21600;
  }

  /**
   * The filenames corresponding to the RTB dictionaries that should be included
   * in instances of RtbDictionaryCollection.
   *
   * @return {!Array<string>} The filenames.
   * @private
   */
  static filenames_() {
    return [
      'callout-status-codes.txt',
      'creative-status-codes.txt'
    ];
  }
}
