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
 * @fileoverview Defines interfaces for communication with Data Studio.
 *
 * This file defines three of the four functions Data Studio calls to interface
 * with the connector: getAuthType(), getSchema(), and getData(). The fourth
 * function, getConfig(), differs for Googlers and non-Googlers and accordingly
 * lives separately in version.js. See the following link for more information
 * about the four key functions:
 * https://developers.google.com/datastudio/connector/build
 */

/**
 * Return the secondary auth configuration required by the connector.
 *
 * https://developers.google.com/datastudio/connector/reference#getauthtype
 * https://developers.google.com/apps-script/reference/data-studio/get-auth-type-response
 *
 * @return {!GetAuthTypeResponse} The auth configuration required by the
 * connector.
 */
function getAuthType() {
  const cc = DataStudioApp.createCommunityConnector();
  // No secondary auth is required because all required scopes are obtained
  // when the connector is "installed" (i.e., used to create a Data Source).
  // This works because the connector only calls Google APIs.
  return cc.newAuthTypeResponse().setAuthType(cc.AuthType.NONE).build();
}

/**
 * Return the config for selecting an RTB account.
 *
 * https://developers.google.com/datastudio/connector/reference#getconfig
 * https://developers.google.com/apps-script/reference/data-studio/config
 *
 * @param {!Object<string, *>} request The config request parameters.
 * @return {!Config} The config for the given request.
 */
function getConfig(request) {
  // Throw an error if a Googler tries to create a Data Source using the
  // non-Googler version of the connector.
  if (isGooglerUser() && !isGooglerConnector()) {
    const notSuitableForGooglersMessage =
        'Unfortunately, this connector is not suitable for use by Googlers.';
    throwConnectorError(
        notSuitableForGooglersMessage, notSuitableForGooglersMessage);
  }

  const cc = DataStudioApp.createCommunityConnector();
  const config = cc.getConfig();

  config.newTextInput()
      .setId('bidderAccountId')
      .setName('Bidder Account ID')
      .setHelpText('ID of the Authorized Buyers or Open Bidding account.')
      .setPlaceholder('12345678')
      .setAllowOverride(true);

  return config.build();
}

/**
 * Return the schema for the connector. This can in principle vary depending on
 * the schema request but does not for this connector.
 *
 * https://developers.google.com/datastudio/connector/reference#getschema
 * https://developers.google.com/apps-script/reference/data-studio/get-schema-response
 *
 * @param {!Object<string, !Object>} request The schema request parameters.
 * @return {!GetSchemaResponse} The schema for the given request.
 */
function getSchema(request) {
  // Names for groups under which fields will appear in the Data Studio UI. They
  // are numbered so they appear in an intuitive order (top of the funnel down).
  const generalDimensions = '01. General dimensions';
  const filterOnlyDimensions = '02. Filter-only dimensions';
  const availableImpressionDimensions = '03. Available impression dimensions';
  const availableImpressionMetrics = '04. Available impression metrics';
  const bidRequestDimensions = '05. Bid request dimensions';
  const bidRequestMetrics = '06. Bid request metrics';
  const bidDimensions = '07. Bid dimensions';
  const bidMetrics = '08. Bid metrics';
  const wonImpressionDimensions = '09. Won impression dimensions';
  const wonImpressionMetrics = '10. Won impression metrics';
  const billedImpressionDimensions = '11. Billed impression dimensions';
  const billedImpressionMetrics = '12. Billed impression metrics';

  // We use the legacy means of specifying the schema to support easier testing.
  const schema = {
    schema: [
      {
        name: 'date',
        label: 'Date',
        group: generalDimensions,
        description: 'The date (in Pacific Time) to which the metrics pertain.',
        dataType: 'STRING',
        semantics: {semanticType: 'YEAR_MONTH_DAY', conceptType: 'DIMENSION'}
      },
      {
        name: 'format',
        label: 'Format',
        group: generalDimensions,
        description:
            ('NATIVE_DISPLAY, NATIVE_VIDEO, NON_NATIVE_DISPLAY, or ' +
             'NON_NATIVE_VIDEO'),
        dataType: 'STRING',
        semantics: {semanticType: 'TEXT', conceptType: 'DIMENSION'}
      },
      {
        name: 'environment',
        label: 'Environment',
        group: generalDimensions,
        description: 'WEB or APP',
        dataType: 'STRING',
        semantics: {semanticType: 'TEXT', conceptType: 'DIMENSION'}
      },
      {
        name: 'platform',
        label: 'Platform',
        group: generalDimensions,
        description: 'DESKTOP, TABLET, or MOBILE',
        dataType: 'STRING',
        semantics: {semanticType: 'TEXT', conceptType: 'DIMENSION'}
      },
      {
        name: 'creativeId',
        label: 'Creative ID',
        group: filterOnlyDimensions,
        description:
            ('The creative ID to which the metrics pertain. This ' +
             'field will not be populated unless you create a Data ' +
             'Studio filter that specifies a single creative ID.'),
        dataType: 'STRING',
        semantics: {semanticType: 'TEXT', conceptType: 'DIMENSION'}
      },
      {
        name: 'dealId',
        label: 'Deal ID',
        group: filterOnlyDimensions,
        description:
            ('The deal ID to which the metrics pertain. This field ' +
             'will not be populated unless you create a Data Studio ' +
             'filter that specifies a single deal ID.'),
        dataType: 'STRING',
        semantics: {semanticType: 'NUMBER', conceptType: 'DIMENSION'}
      },
      {
        name: 'filteredByPretargeting',
        label: 'Filtered by pretargeting',
        group: availableImpressionDimensions,
        description:
            ('Whether available impressions were filtered by your ' +
             'pretargeting configurations. Only populated for ' +
             'available impression metrics.'),
        dataType: 'BOOLEAN',
        semantics: {semanticType: 'BOOLEAN', conceptType: 'DIMENSION'}
      },
      {
        name: 'availableImpressions',
        label: 'Available impressions',
        group: availableImpressionMetrics,
        description:
            ('Impression opportunities that may match your ' +
             'pretargeting configurations. Does not reflect bid request ' +
             'flattening.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'inventoryMatches',
        label: 'Inventory matches',
        group: availableImpressionMetrics,
        description:
            ('Available impressions that matched your pretargeting ' +
             'configurations. Does not reflect bid request flattening.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'},
      },
      {
        name: 'calloutStatusId',
        label: 'Callout status ID',
        group: bidRequestDimensions,
        description:
            ('The ID of the callout status. See https://developers.' +
             'google.com/authorized-buyers/rtb/downloads/' +
             'callout-status-codes for possible values. Only ' +
             'populated for bid request metrics.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'DIMENSION'}
      },
      {
        name: 'calloutStatus',
        label: 'Callout status',
        group: bidRequestDimensions,
        description:
            ('The name of the callout status. Only populated for bid request ' +
             'metrics.'),
        dataType: 'STRING',
        semantics: {semanticType: 'TEXT', conceptType: 'DIMENSION'},
        isDefault: true
      },
      {
        name: 'bidRequests',
        label: 'Bid requests',
        group: bidRequestMetrics,
        description:
            ('Bid requests that may have been sent. Reflects bid request ' +
             'flattening.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'},
        isDefault: true
      },
      {
        name: 'filteredBidRequests',
        label: 'Filtered bid requests',
        group: bidRequestMetrics,
        description:
            ('Bid requests that were not sent. Reflects bid request ' +
             'flattening.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'sentBidRequests',
        label: 'Sent bid requests',
        group: bidRequestMetrics,
        description:
            ('Bid requests that were sent. Reflects bid request flattening.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'bidResponseErrors',
        label: 'Bid response errors',
        group: bidRequestMetrics,
        description:
            ('Bid requests for which (1) a response was received and (2) the ' +
             'response resulted in an error. Reflects bid request flattening.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'successfulResponses',
        label: 'Successful responses',
        group: bidRequestMetrics,
        description:
            ('Bid requests for which (1) a response was received and (2) the ' +
             'response did not result in an error. Reflects bid request ' +
             'flattening.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'bidResponsesWithBids',
        label: 'Bid responses with bids',
        group: bidRequestMetrics,
        description:
            ('Bid requests for which (1) a response was received and (2) the ' +
             'response contained a bid. Reflects bid request flattening.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'creativeStatusId',
        label: 'Creative status ID',
        group: bidDimensions,
        description:
            ('The ID of the creative status. Only populated for bid ' +
             'metrics.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'DIMENSION'}
      },
      {
        name: 'creativeStatus',
        label: 'Creative status',
        group: bidDimensions,
        description:
            ('The name of the creative status. Only populated for ' +
             'bid metrics.'),
        dataType: 'STRING',
        semantics: {semanticType: 'TEXT', conceptType: 'DIMENSION'}
      },
      {
        name: 'bids',
        label: 'Bids',
        group: bidMetrics,
        description: 'Bids.',
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'filteredBids',
        label: 'Filtered bids',
        group: bidMetrics,
        description: 'Bids that were filtered before the real-time auction.',
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'losingBids',
        label: 'Losing bids',
        group: bidMetrics,
        description: 'Bids that lost in the real-time auction.',
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'bidsInAuction',
        label: 'Bids in auction',
        group: bidMetrics,
        description:
            ('Bids that were not filtered before the real-time ' +
             'auction.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'wonImpressionStatus',
        label: 'Won impression status',
        group: wonImpressionDimensions,
        description:
            ('BILLED, AD_NOT_RENDERED, INVALID_IMPRESSION, ' +
             'FATAL_VAST_ERROR, or LOST_IN_MEDIATION. Only ' +
             'populated for won impression metrics.'),
        dataType: 'STRING',
        semantics: {semanticType: 'TEXT', conceptType: 'DIMENSION'}
      },
      {
        name: 'impressionsWon',
        label: 'Impressions won',
        group: wonImpressionMetrics,
        description: 'Real-time auctions where the bidder won.',
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'nonBillableWinningBids',
        label: 'Non-billable winning bids',
        group: wonImpressionMetrics,
        description:
            ('Real-time auctions where the bidder won but was not ' +
             'billed.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'reachedQueries',
        label: 'Reached queries',
        group: wonImpressionMetrics,
        description:
            ('Real-time auctions where the bidder won and did not ' +
             'subsequently lose in mediation.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'viewabilityStatus',
        label: 'Viewability status',
        group: billedImpressionDimensions,
        description:
            ('VIEWABLE, NOT_VIEWABLE, or NOT_MEASURABLE. Only ' +
             'populated for billed impression metrics.'),
        dataType: 'STRING',
        semantics: {semanticType: 'TEXT', conceptType: 'DIMENSION'}
      },
      {
        name: 'billedImpressions',
        label: 'Billed impressions',
        group: billedImpressionMetrics,
        description: 'Real-time auctions where the bidder won and was billed.',
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'measurableImpressions',
        label: 'Measurable impressions',
        group: billedImpressionMetrics,
        description:
            ('Billed impressions where ActiveView was able to ' +
             'measure viewability.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      },
      {
        name: 'viewableImpressions',
        label: 'Viewable impressions',
        group: billedImpressionMetrics,
        description:
            ('Billed impressions where ActiveView determined the ' +
             'impression was viewable.'),
        dataType: 'NUMBER',
        semantics: {semanticType: 'NUMBER', conceptType: 'METRIC'}
      }
    ]
  };

  return schema;
}

/**
 * Returns data for the given request from Data Studio.
 *
 * https://developers.google.com/datastudio/connector/reference#getdata
 * https://developers.google.com/apps-script/reference/data-studio/get-data-response
 *
 * @param {!Object<string, *>} request Data request parameters.
 * @return {!GetDataResponse} Data for the given request.
 */
function getData(request) {
  if (isGooglerConnector() && !isGooglerUser()) {
    const notSuitableForNonGooglersMessage =
        ('Unfortunately, this report is not suitable for use outside Google. ' +
         'Please contact the person who shared the report with you to ' +
         'discuss other options.');
    throwConnectorError(
        notSuitableForNonGooglersMessage, notSuitableForNonGooglersMessage);
  }

  const dataRequest = new DataRequest(
      request,
      /* retainFilterSets= */ !isGooglerConnector(),
      /* disableCacheServing= */ false);
  return dataRequest.getData();
}

/**
 * Checks if the user is an "admin" of the connector, where "admin" means the
 * user should see debug messages and stack traces.
 *
 * https://developers.google.com/datastudio/connector/reference#optional_functions
 * https://developers.google.com/datastudio/connector/debug#enablingdisabling_debug_features
 *
 * @return {boolean} Whether the effective user is an admin user.
*/
function isAdminUser() {
  // Since users deploy their own instances of the connector, we return true to
  // indicate that debug messages and stack traces should be shown to all users
  // of connector instances deployed from this code. See links in the function
  // description above for more details.
  return true;
}

/**
 * Checks if the effective user is a Googler.
 *
 * @return {boolean} Whether the effective user is a Googler.
*/
function isGooglerUser() {
  return RegExp('@google.com$').test(Session.getEffectiveUser().getEmail());
}

/**
 * Shows an error to the end user.
 *
 * https://developers.google.com/datastudio/connector/error-handling#user-facing-errors
 *
 * @param {string} userText Error message to display to all users.
 * @param {string} debugText Additional error message to display to admin users.
 */
function throwConnectorError(userText, debugText) {
  DataStudioApp.createCommunityConnector()
      .newUserError()
      .setText(userText)
      .setDebugText(debugText)
      .throwException();
}
