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

/** Calculates which API endpoints must be called to fulfill a data request. */
class EndpointCalculator {

  /** @param {!Object<string, *>} request Data request parameters. */
  constructor(request) {
    this.request = request;
  }

  /**
   * Calculates which API endpoints must be called to fulfill a data request.
   *
   * @return {!Array<string>} The endpoints that must be called.
   */
  getRequiredEndpoints() {
    const result = new Set();
    for (const field of this.request.fields) {
      const endpoints = EndpointCalculator.metricEndpointMap_()[field.name];
      if (endpoints) {
        endpoints.forEach(endpoint => result.add(endpoint));
      }
    }
    return [...result];
  }

  /**
   * Maps metrics defined in getSchema() to the API endpoints that must be
   * called to calculate them.
   *
   * @return {!Object<string, !Array<string>>} Map of metrics to endpoints.
   * @private
   */
  static metricEndpointMap_() {
    return {
      availableImpressions: ['impressionMetrics'],
      inventoryMatches: ['impressionMetrics'],
      bidRequests: [
        'bidResponseErrors',
        'impressionMetrics',
        'filteredBidRequests',
      ],
      successfulResponses: ['impressionMetrics'],
      filteredBidRequests: ['filteredBidRequests'],
      sentBidRequests: [
        'bidResponseErrors',
        'impressionMetrics',
      ],
      bidResponseErrors: ['bidResponseErrors'],
      bidResponsesWithBids: ['impressionMetrics'],
      bids: [
        'bidMetrics',
        'filteredBids',
        'losingBids'
      ],
      filteredBids: ['filteredBids'],
      losingBids: ['losingBids'],
      bidsInAuction: ['bidMetrics'],
      impressionsWon: [
        'bidMetrics',
        'nonBillableWinningBids'
      ],
      reachedQueries: ['bidMetrics'],
      nonBillableWinningBids: ['nonBillableWinningBids'],
      billedImpressions: ['bidMetrics'],
      measurableImpressions: ['bidMetrics'],
      viewableImpressions: ['bidMetrics']
    };
  }
}
