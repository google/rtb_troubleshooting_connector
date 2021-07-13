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
 * A fake version of Google Apps Script's Cache Service.
 *
 * https://developers.google.com/apps-script/reference/cache/cache-service
 */
class CacheService {
  constructor() {}

  /**
   * https://developers.google.com/apps-script/reference/cache/cache-service#getScriptCache()
   *
   * @return {!Cache} A new instance of the fake Google Apps Script Cache class.
   */
  static getScriptCache() {
    return new Cache();
  }

  /**
   * https://developers.google.com/apps-script/reference/cache/cache-service#getUserCache()
   *
   * @return {!Cache} A new instance of the fake Google Apps Script Cache class.
   */
  static getUserCache() {
    return new Cache();
  }
}
