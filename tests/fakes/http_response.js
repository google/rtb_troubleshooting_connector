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
 * A fake version of Google Apps Script's HttpResponse class.
 *
 * https://developers.google.com/apps-script/reference/url-fetch/http-response
 */
class HttpResponse {
  /**
   * @param {number} responseCode The HTTP status code (200 for OK, etc.) of an
   *     HTTP response.
   * @param {string} contentText The content of an HTTP response encoded as a
   *     string.
   */
  constructor(responseCode, contentText) {
    this.responseCode = responseCode;
    this.contentText = contentText;
  }

  /**
   * https://developers.google.com/apps-script/reference/url-fetch/http-response#getResponseCode()
   *
   * @return {number} The HTTP status code of the fake response.
   */
  getResponseCode() {
    return this.responseCode;
  }

  /**
   * https://developers.google.com/apps-script/reference/url-fetch/http-response#getcontenttext
   *
   * @return {string} The fake HTTP response content encoded as a string.
   */
  getContentText() {
    return this.contentText;
  }
}
