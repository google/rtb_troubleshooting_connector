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
 * @fileoverview Constants not specific to any class.
 */

/** Namespace for constants. */
const constants = {};

/**
 * Maps API endpoints to the name of the API response object that contains the
 * metrics. Used to access the rows in an API response based on the endpoint
 * from which it originated.
 */
constants.ENDPOINT_METRIC_OBJECT_MAP = {
  bidMetrics: 'bidMetricsRows',
  bidResponseErrors: 'calloutStatusRows',
  filteredBidRequests: 'calloutStatusRows',
  filteredBids: 'creativeStatusRows',
  impressionMetrics: 'impressionMetricsRows',
  losingBids: 'creativeStatusRows',
  nonBillableWinningBids: 'nonBillableWinningBidStatusRows'
};
