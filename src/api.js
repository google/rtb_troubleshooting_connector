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

/** Class for interacting with RTB APIs. */
class Api {

  /** @param {string} authToken An OAuth token.*/
  constructor(authToken) {
    this.authToken = authToken;
  }

  /**
   * Confirms that the supplied authToken can access the requested account.
   *
   * @param {string} bidderAccountId ID of the requested account.
   */
  confirmAccountAccess(bidderAccountId) {
    const bidderName = 'bidders/' + bidderAccountId;
    const url = `${Api.baseUrlRtbV1_()}/${bidderName}`;
    const options = {
      method: 'get',
      headers: {Authorization: `Bearer ${this.authToken}`},
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    const responseContent = JSON.parse(response.getContentText());
    if (response.getResponseCode() !== 200 ||
        (responseContent.name || '').toString() !== bidderName) {
      throwConnectorError(
          Api.unconfirmedAccountAccessError_(bidderAccountId),
          response.getContentText());
    }
  }

  /**
   * Creates a specified filterSet.
   *
   * https://developers.google.com/authorized-buyers/apis/reference/rest/v2beta1/bidders.accounts.filterSets
   *
   * @param {!Object<string, *>} filterSet The filterSet to create.
   */
  createFilterSet(filterSet) {
    const bidderAccountId = filterSet.name.split('/')[1];
    const url = [
      Api.baseUrlV2Beta1_(),
      '/bidders/',
      bidderAccountId,
      '/filterSets?isTransient=true'
    ].join('');
    const options = {
      method: 'post',
      headers: {Authorization: `Bearer ${this.authToken}`},
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify(filterSet)
    };
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    if (![200, 409].includes(responseCode)) {
      switch(responseCode) {
        case 429: {
          throwConnectorError(Api.quotaExhaustedError_(), responseText);
          break;
        }
        default: {
          throwConnectorError(Api.genericApiError_(), responseText);
          break;
        }
      }
    }
  }

  /**
   * Deletes a specified filterSet.
   *
   * https://developers.google.com/authorized-buyers/apis/reference/rest/v2beta1/bidders.accounts.filterSets
   *
   * @param {!Object<string, *>} filterSet The filterSet to delete.
   */
  deleteFilterSet(filterSet) {
    const url = `${Api.baseUrlV2Beta1_()}/${filterSet.name}`;
    const options = {
      method: 'delete',
      headers: {Authorization: `Bearer ${this.authToken}`},
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    if (![200, 404].includes(responseCode)) {
      switch(responseCode) {
        case 429: {
          throwConnectorError(Api.quotaExhaustedError_(), responseText);
          break;
        }
        default: {
          throwConnectorError(Api.genericApiError_(), responseText);
          break;
        }
      }
    }
  }

  /**
   * Retrieves and merges all pages of data rows from the API.
   *
   * https://developers.google.com/authorized-buyers/apis/guides/v2/rtb-troubleshooting#retrieve-rtb-troubleshooting-metrics
   *
   * @param {!Object<string, *>} filterSet The filterSet for which to retrieve
   *     metrics.
   * @param {string} endpoint The endpoint from which to retrieve metrics.
   * @return {!Array<!Object<string, *>>} Rows of data.
   */
  getApiRows(filterSet, endpoint) {
    const result = [];
    const rowType = constants.ENDPOINT_METRIC_OBJECT_MAP[endpoint];
    let currentPageResult = null;
    let currentPageApiRows = null;
    let nextPageToken = null;

    do {
      currentPageResult = this.listMetrics_(filterSet, endpoint, nextPageToken);
      currentPageApiRows = currentPageResult[rowType];
      if (currentPageApiRows) {
        currentPageApiRows.forEach(apiRow => result.push(apiRow));
      }
      nextPageToken = currentPageResult.nextPageToken;
    } while (nextPageToken);

    return result;
  }

  /**
   * Retrieves a single page of data rows from the API.
   *
   * https://developers.google.com/authorized-buyers/apis/guides/v2/rtb-troubleshooting#retrieve-rtb-troubleshooting-metrics
   *
   * @param {!Object<string, *>} filterSet The filterSet for which to retrieve
   *     metrics.
   * @param {string} endpoint The endpoint from which to retrieve metrics.
   * @param {string} pageToken A token identifying a page of results.
   * @return {!Object<string, !Array<!Object<string, *>>>} An API response
   *     object containing rows of data.
   * @private
   */
  listMetrics_(filterSet, endpoint, pageToken) {
    let url = `${Api.baseUrlV2Beta1_()}/${filterSet.name}/${endpoint}`;
    if (pageToken) {
      url = `${url}?pageToken=${pageToken}`;
    }
    const options = {
      method: 'get',
      headers: {Authorization: `Bearer ${this.authToken}`},
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    if (responseCode !== 200) {
      switch(responseCode) {
        case 429: {
          throwConnectorError(Api.quotaExhaustedError_(), responseText);
          break;
        }
        default: {
          throwConnectorError(Api.genericApiError_(), responseText);
          break;
        }
      }
    }
    return JSON.parse(responseText);
  }


  /**
   * @return {string} Base URL for requests to the Real-time bidding API v1.
   * @private
   */
  static baseUrlRtbV1_() {
    return 'https://realtimebidding.googleapis.com/v1';
  }

  /**
   * @return {string} Base URL for requests to v2beta1 APIs.
   * @private
   */
  static baseUrlV2Beta1_() {
    return 'https://adexchangebuyer.googleapis.com/v2beta1';
  }

  /**
   * Error message to display to the end user when the connector cannot confirm
   * access to the requested bidder account.
   *
   * @param {string} bidderAccountId ID of the requested account.
   * @return {string} The error message.
   * @private
   */
  static unconfirmedAccountAccessError_(bidderAccountId) {
    return 'Unable to confirm that the supplied credentials are valid for ' +
        'access to account ' + bidderAccountId + '. Please confirm that this ' +
        'is the correct bidder account and that you have permission to make ' +
        'API calls under this account.';
  }

  /**
   * Error message to display to the end user when the connector has exhausted
   * its API quota.
   *
   * @return {string} The error message.
   * @private
   */
  static quotaExhaustedError_() {
    return 'Unable to retrieve the requested data because the connector has ' +
        'exhausted its API quota. Please try again later.';
  }

  /**
   * Error message to display to the end user when the connector encounters an
   * unexpected API error.
   *
   * @return {string} The error message.
   * @private
   */
  static genericApiError_() {
    return 'Encountered an error when calling the API. Please try again later.';
  }
}
