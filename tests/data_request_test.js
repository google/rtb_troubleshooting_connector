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
 * @fileoverview Tests for the DataRequest class.
 */

class DataRequestTest {
  constructor() {
    // Mock class methods before creating our DataRequest instance.
    FilterSetCalculator.getCurrentDateString_ = createMockFunction();
    expectCall(FilterSetCalculator.getCurrentDateString_)
        ()
        .willRepeatedly(returnWith('2020-01-01'));

    // This generic setup will be customized as needed in each test.
    this.expectedFilterSets = null;
    this.expectedEndpoints = null;
    const genericEmptyRequest = {
      scriptParams: {lastRefresh: '1577836800000'},
      configParams: {bidderAccountId: '12345678'}
    };

    this.dataRequest = new DataRequest(
        genericEmptyRequest,
        /* retainFilterSets= */ true,
        /* disableCacheServing= */ false);

    // Now that the DataRequest instance exists, mock instance methods that
    // rely on network calls and should behave the same way in all tests.
    const testRtbDictionaries = {
      'callout-status-codes.txt': {
        '1': 'Callout successful.',
        '5': 'Out of quota.',
        '7': 'Callout HTTP request timed out.'
      },
      'creative-status-codes.txt': {
        '1': 'Creative won the auction',
        '10': 'Creative was not approved',
        '79': 'Creative was outbid'
      }
    };
    this.dataRequest.rtbDictionaries.getRtbDictionaries =
        createMockFunction();
    expectCall(this.dataRequest.rtbDictionaries.getRtbDictionaries)
        ()
        .willRepeatedly(returnWith(testRtbDictionaries));

    const doNothing = () => {};

    this.dataRequest.api.confirmAccountAccess = createMockFunction();
    expectCall(this.dataRequest.api.confirmAccountAccess)
        (_)
        .willRepeatedly(doNothing);

    this.dataRequest.api.createFilterSet = createMockFunction();
    expectCall(this.dataRequest.api.createFilterSet)
        (_)
        .willRepeatedly(doNothing);
  }

  /**
   * Creates mocks that return static values for all expected calls to
   * Api.getApiRows.
   */
  createMocksForExpectedCallsToGetApiRows() {
    this.dataRequest.api.getApiRows = createMockFunction();
    for (const filterSet of this.expectedFilterSets) {
      for (const endpoint of this.expectedEndpoints) {
        expectCall(this.dataRequest.api.getApiRows)
            (recursivelyEquals(filterSet), endpoint)
            .willOnce(returnWith(
                fakeData.apiRows()[filterSet.name][endpoint]));
      }
    }
  }
}
registerTestSuite(DataRequestTest);

DataRequestTest.prototype
    .testAvailableImpressionDimensionsAndMetrics = function() {
  this.dataRequest.request.fields = [
       {name: 'filteredByPretargeting'},
       {name: 'availableImpressions'}
  ];
  this.expectedFilterSets = [fakeData.filterSets().noFilters];
  this.expectedEndpoints = ['impressionMetrics'];

  this.createMocksForExpectedCallsToGetApiRows();

  this.expectedResult = {
    schema: this.dataRequest.getRequestSchema_(),
    rows: [
      {'values':[false,900]},
      {'values':[true,100]},
      {'values':[false,1800]},
      {'values':[true,200]}
    ],
    filtersApplied: false
  };
  this.actualResult = this.dataRequest.getData();
  expectThat(
      this.actualResult.rows, recursivelyEquals(this.expectedResult.rows));
};

DataRequestTest.prototype.testBidRequestDimensionsAndMetrics = function() {
  this.dataRequest.request.fields = [
    {name: 'calloutStatusId'},
    {name: 'calloutStatus'},
    {name: 'bidRequests'},
    {name: 'filteredBidRequests'},
    {name: 'sentBidRequests'},
    {name: 'bidResponseErrors'},
    {name: 'successfulResponses'},
    {name: 'bidResponsesWithBids'}
  ];
  this.expectedFilterSets = [fakeData.filterSets().noFilters];
  this.expectedEndpoints = [
    'bidResponseErrors',
    'filteredBidRequests',
    'impressionMetrics'
  ];

  this.createMocksForExpectedCallsToGetApiRows();

  this.expectedResult = {
    schema: this.dataRequest.getRequestSchema_(),
    rows: [
      {"values":[7,"Callout HTTP request timed out.",50,null,50,50,null,null]},
      {"values":[7,"Callout HTTP request timed out.",100,null,100,100,null,null]},
      {"values":[1,"Callout successful.",750,null,750,null,750,400]},
      {"values":[1,"Callout successful.",1500,null,1500,null,1500,800]},
      {"values":[5,"Out of quota.",50,50,null,null,null,null]},
      {"values":[5,"Out of quota.",100,100,null,null,null,null]},
    ],
    filtersApplied: false
  };
  this.actualResult = this.dataRequest.getData();
  expectThat(
      this.actualResult.rows, recursivelyEquals(this.expectedResult.rows));
};

DataRequestTest.prototype.testBidDimensionsAndMetrics = function() {
  this.dataRequest.request.fields = [
    {name: 'creativeStatusId'},
    {name: 'creativeStatus'},
    {name: 'bids'},
    {name: 'filteredBids'},
    {name: 'losingBids'},
    {name: 'bidsInAuction'}
  ];
  this.expectedFilterSets = [fakeData.filterSets().noFilters];
  this.expectedEndpoints = [
    'bidMetrics',
    'filteredBids',
    'losingBids'
  ];

  this.createMocksForExpectedCallsToGetApiRows();

  this.expectedResult = {
    schema: this.dataRequest.getRequestSchema_(),
    rows: [
      {"values":[1,"Creative won the auction",500,null,null,500]},
      {"values":[1,"Creative won the auction",1000,null,null,1000]},
      {"values":[10,"Creative was not approved",50,50,null,null]},
      {"values":[10,"Creative was not approved",100,100,null,null]},
      {"values":[79,"Creative was outbid",250,null,250,250]},
      {"values":[79,"Creative was outbid",500,null,500,500]},
    ],
    filtersApplied: false
  };
  this.actualResult = this.dataRequest.getData();
  expectThat(
      this.actualResult.rows, recursivelyEquals(this.expectedResult.rows));
};

DataRequestTest.prototype.testWonImpressionDimensionsMetrics = function() {
  this.dataRequest.request.fields = [
    {name: 'wonImpressionStatus'},
    {name: 'impressionsWon'},
    {name: 'nonBillableWinningBids'},
    {name: 'reachedQueries'}
  ];
  this.expectedFilterSets = [fakeData.filterSets().noFilters];
  this.expectedEndpoints = [
    'bidMetrics',
    'nonBillableWinningBids'
  ];

  this.createMocksForExpectedCallsToGetApiRows();

  this.expectedResult = {
    schema: this.dataRequest.getRequestSchema_(),
    rows: [
      {"values":["BILLED",400,null,400]},
      {"values":["BILLED",800,null,800]},
      {"values":["FATAL_VAST_ERROR",50,50,50]},
      {"values":["FATAL_VAST_ERROR",100,100,100]}
    ],
    filtersApplied: false
  };
  this.actualResult = this.dataRequest.getData();
  expectThat(
     this.actualResult.rows, recursivelyEquals(this.expectedResult.rows));
};

DataRequestTest.prototype.testBilledImpressionDimensionsMetrics = function() {
  this.dataRequest.request.fields = [
    {name: 'viewabilityStatus'},
    {name: 'billedImpressions'},
    {name: 'measurableImpressions'},
    {name: 'viewableImpressions'}
  ];
  this.expectedFilterSets = [fakeData.filterSets().noFilters];
  this.expectedEndpoints = ['bidMetrics'];

  this.createMocksForExpectedCallsToGetApiRows();

  this.expectedResult = {
    schema: this.dataRequest.getRequestSchema_(),
    rows: [
      {"values":["VIEWABLE",300,300,300]},
      {"values":["NOT_VIEWABLE",100,100,null]},
      {"values":["VIEWABLE",600,600,600]},
      {"values":["NOT_VIEWABLE",200,200,null]}
    ],
    filtersApplied: false
  };
  this.actualResult = this.dataRequest.getData();
  expectThat(
     this.actualResult.rows, recursivelyEquals(this.expectedResult.rows));
};

DataRequestTest.prototype.testNonFilterDimensionsAndAllMetrics = function() {

  this.dataRequest.request.fields = [];
  for (let field of getSchema().schema) {
    if (!(['creativeId', 'dealId'].includes(field.name))) {
      this.dataRequest.request.fields.push({name: field.name});
    }
  }

  this.expectedFilterSets = [];
  for (let filterSetKey of Object.keys(fakeData.filterSets())) {
    if (!(['noFilters', 'app', 'web', 'creativeIdabc123']
          .includes(filterSetKey))) {
      this.expectedFilterSets.push(
          fakeData.filterSets()[filterSetKey]);
    }
  }

  this.expectedEndpoints = [
    'bidMetrics',
    'bidResponseErrors',
    'filteredBids',
    'filteredBidRequests',
    'impressionMetrics',
    'losingBids',
    'nonBillableWinningBids'
  ];

  this.createMocksForExpectedCallsToGetApiRows();

  this.expectedResult = {
    schema: this.dataRequest.getRequestSchema_(),
    rows: [
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",false,900,900,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",true,100,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",null,null,null,1,"Callout successful.",750,null,750,null,750,400,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",null,null,null,7,"Callout HTTP request timed out.",50,null,50,50,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",null,null,null,5,"Out of quota.",50,50,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",null,null,null,null,null,null,null,null,null,null,null,1,"Creative won the auction",500,null,null,500,null,null,null,null,null,null,null,null]},
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"BILLED",400,null,400,null,null,null,null]},
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"VIEWABLE",300,300,300]},
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"NOT_VIEWABLE",100,100,null]},
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",null,null,null,null,null,null,null,null,null,null,null,10,"Creative was not approved",50,50,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",null,null,null,null,null,null,null,null,null,null,null,79,"Creative was outbid",250,null,250,250,null,null,null,null,null,null,null,null]},
      {"values":["20201215","NON_NATIVE_VIDEO","APP","MOBILE",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"FATAL_VAST_ERROR",50,50,50,null,null,null,null]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",false,1800,1800,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",true,200,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",null,null,null,1,"Callout successful.",1500,null,1500,null,1500,800,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",null,null,null,7,"Callout HTTP request timed out.",100,null,100,100,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",null,null,null,5,"Out of quota.",100,100,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",null,null,null,null,null,null,null,null,null,null,null,1,"Creative won the auction",1000,null,null,1000,null,null,null,null,null,null,null,null]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"BILLED",800,null,800,null,null,null,null]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"VIEWABLE",600,600,600]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"NOT_VIEWABLE",200,200,null]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",null,null,null,null,null,null,null,null,null,null,null,10,"Creative was not approved",100,100,null,null,null,null,null,null,null,null,null,null]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",null,null,null,null,null,null,null,null,null,null,null,79,"Creative was outbid",500,null,500,500,null,null,null,null,null,null,null,null]},
      {"values":["20201230","NON_NATIVE_DISPLAY","WEB","DESKTOP",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"FATAL_VAST_ERROR",100,100,100,null,null,null,null]}
    ],
    filtersApplied: false
  };
  this.actualResult = this.dataRequest.getData();
  expectThat(
     this.actualResult.rows, recursivelyEquals(this.expectedResult.rows));
};

DataRequestTest.prototype
    .testCreativeIdFilterWithBidDimensionsAndMetrics = function() {

  this.dataRequest.request.dimensionsFilters = [[{
      fieldName: 'creativeId',
      type: 'INCLUDE',
      operator: 'EQUALS',
      values: ['abc123']
    }]];

  this.dataRequest.request.fields = [
      {name: 'creativeId', forFilterOnly: true},
      {name: 'creativeStatusId'},
      {name: 'creativeStatus'},
      {name: 'bids'},
      {name: 'filteredBids'},
      {name: 'losingBids'},
      {name: 'bidsInAuction'}
  ];
  this.expectedFilterSets = [fakeData.filterSets().creativeIdabc123];
  this.expectedEndpoints = [
    'bidMetrics',
    'filteredBids',
    'losingBids'
  ];

  this.createMocksForExpectedCallsToGetApiRows();

  this.expectedResult = {
    schema: this.dataRequest.getRequestSchema_(),
    rows: [
      {"values":["abc123",1,"Creative won the auction",500,null,null,500]},
      {"values":["abc123",10,"Creative was not approved",50,50,null,null]},
      {"values":["abc123",79,"Creative was outbid",250,null,250,250]}
    ],
    filtersApplied: false
  };
  this.actualResult = this.dataRequest.getData();
  expectThat(
     this.actualResult.rows, recursivelyEquals(this.expectedResult.rows));
};

DataRequestTest.prototype
    .testFilterSetsDeletedWhenRetainFilterSetsFlagIsFalse = function() {
  this.dataRequest.retainFilterSets = false;
  this.dataRequest.request.fields = [
       {name: 'filteredByPretargeting'},
       {name: 'availableImpressions'}
  ];
  this.expectedFilterSets = [fakeData.filterSets().noFilters];
  this.expectedEndpoints = ['impressionMetrics'];

  this.createMocksForExpectedCallsToGetApiRows();

  this.dataRequest.api.deleteFilterSet = createMockFunction();
  expectCall(this.dataRequest.api.deleteFilterSet)
      (recursivelyEquals(fakeData.filterSets().noFilters))
      .willOnce(() => {});

  this.dataRequest.getData();
};

DataRequestTest.prototype
    .testDataServedFromCacheAfterFirstRequest = function() {
  this.dataRequest.request.fields = [
       {name: 'filteredByPretargeting'},
       {name: 'availableImpressions'}
  ];
  this.expectedFilterSets = [fakeData.filterSets().noFilters];
  this.expectedEndpoints = ['impressionMetrics'];

  // The first time we call getData(), the cache will be empty, so we (1) set an
  // expectation that api.getApiRows will be called and (2) create a mock to
  // return fake data.
  this.createMocksForExpectedCallsToGetApiRows();
  const dataFromApi = this.dataRequest.getData();

  // After the initial call to getData(), the cache will be populated, so we set
  // an expectation that subsequent calls to getData() will result in calls to
  // apiRowCache.getApiRows.
  const realGetApiRows = this.dataRequest.apiRowCache.getApiRows;
  this.dataRequest.apiRowCache.getApiRows = createMockFunction();
  expectCall(this.dataRequest.apiRowCache.getApiRows)
      (recursivelyEquals(this.expectedFilterSets[0]), this.expectedEndpoints[0])
      .willOnce(realGetApiRows);
  const dataFromCache = this.dataRequest.getData();

  // Finally, we confirm the cached data is the same as the data from the API.
  expectThat(dataFromCache, recursivelyEquals(dataFromApi));
};

DataRequestTest.prototype
    .testDataServedFromApiWhenCacheServingDisabled = function() {
  this.dataRequest.request.fields = [
       {name: 'filteredByPretargeting'},
       {name: 'availableImpressions'}
  ];
  this.expectedFilterSets = [fakeData.filterSets().noFilters];
  this.expectedEndpoints = ['impressionMetrics'];

  // Set an expectation that this test will produce two calls to api.getApiRows
  // and create a mock to return fake data.
  this.dataRequest.api.getApiRows = createMockFunction();
  expectCall(this.dataRequest.api.getApiRows)
      (recursivelyEquals(this.expectedFilterSets[0]), this.expectedEndpoints[0])
      .times(2)
      .willRepeatedly(returnWith(fakeData.apiRows()
                                 [this.expectedFilterSets[0].name]
                                 [this.expectedEndpoints[0]]));

  // Call getData() once, which will populate the cache and satisfy one of the
  // two expected calls to api.getApiRows.
  this.dataRequest.getData();
  // Disable cache serving for the next call to getData().
  this.dataRequest.disableCacheServing = true;
  // Call getData() again, which should satisfy our second expected call to
  // api.getApiRows. Were cached serving not disabled, we would instead expect
  // a call to apiRowCache.getApiRows.
  this.dataRequest.getData();
};

DataRequestTest.prototype
    .testValidationErrorGeneratedForInvalidFilterType = function() {
  this.dataRequest.request.fields = [
    {name: 'date'},
    {name: 'creativeId'},
    {name: 'bids'},
  ];
  this.dataRequest.request.dimensionsFilters = [
    [{
      fieldName: 'creativeId',
      values: ['abc123'],
      type: 'EXCLUDE',
      operator: 'EQUALS'
    }]
  ];

  const expectedErrorMessage = 'Only filter type INCLUDE is supported for ' +
      'dimensions creativeId, dealId';

  this.dataRequest.validate_();
  this.dataRequest.updateValidationErrorMessage_();
  expectEq(this.dataRequest.validationErrorMessage, expectedErrorMessage);
};

DataRequestTest.prototype
    .testValidationErrorGeneratedForInvalidFilterOperator = function() {
  this.dataRequest.request.fields = [
    {name: 'date'},
    {name: 'creativeId'},
    {name: 'bids'},
  ];
  this.dataRequest.request.dimensionsFilters = [
    [{
      fieldName: 'creativeId',
      values: ['abc123'],
      type: 'INCLUDE',
      operator: 'CONTAINS'
    }]
  ];

  const expectedErrorMessage = 'Only filter operators EQUALS, IN_LIST are ' +
      'supported for dimensions creativeId, dealId';

  this.dataRequest.validate_();
  this.dataRequest.updateValidationErrorMessage_();
  expectEq(this.dataRequest.validationErrorMessage, expectedErrorMessage);
};

DataRequestTest.prototype
    .testValidationErrorGeneratedForRepeatedIdFilter = function() {
  this.dataRequest.request.fields = [
    {name: 'date'},
    {name: 'creativeId'},
    {name: 'bids'},
  ];
  this.dataRequest.request.dimensionsFilters = [
    [{
      fieldName: 'creativeId',
      values: ['abc123'],
      type: 'INCLUDE',
      operator: 'EQUALS'
    }],
    [{
      fieldName: 'creativeId',
      values: ['def456'],
      type: 'INCLUDE',
      operator: 'EQUALS'
    }]
  ];

  const expectedErrorMessage = 'Dimension creativeId requested with multiple ' +
      'filters. Only one filter each is supported for filter-only ' +
      'dimensions. Please remove any additional filters. If you are trying ' +
      'to retrieve data for multiple IDs, please use a single filter with ' +
      'the IN operator.';

  this.dataRequest.validate_();
  this.dataRequest.updateValidationErrorMessage_();
  expectEq(this.dataRequest.validationErrorMessage, expectedErrorMessage);
};

DataRequestTest.prototype
    .testValidationErrorGeneratedForInvalidFilterValue = function() {
  this.dataRequest.request.fields = [
    {name: 'date'},
    {name: 'creativeId'},
    {name: 'bids'},
  ];
  this.dataRequest.request.dimensionsFilters = [
    [{
      fieldName: 'creativeId',
      values: ['abc123'],
      type: 'INCLUDE',
      operator: 'EQUALS'
    }],
    [{
      fieldName: 'format',
      values: ['AUDIO'],
      type: 'INCLUDE',
      operator: 'EQUALS'
    }]
  ];

  const expectedErrorMessage = 'Filter value for dimension format must be ' +
      'one of NATIVE_DISPLAY, NATIVE_VIDEO, NON_NATIVE_DISPLAY, ' +
      'NON_NATIVE_VIDEO';

  this.dataRequest.validate_();
  this.dataRequest.updateValidationErrorMessage_();
  expectEq(this.dataRequest.validationErrorMessage, expectedErrorMessage);
};

DataRequestTest.prototype
    .testGenerateValidationErrorForIdFieldWithoutFilter = function() {
  this.dataRequest.request.fields = [
    {name: 'date'},
    {name: 'creativeId'},
    {name: 'bids'},
  ];
  this.dataRequest.request.dimensionsFilters = [
    [{
      fieldName: 'dealId',
      values: ['1234'],
      type: 'INCLUDE',
      operator: 'EQUALS'
    }]
  ];

  const expectedErrorMessage = 'Filter-only dimension creativeId requested ' +
      'without a corresponding filter';

  this.dataRequest.validate_();
  this.dataRequest.updateValidationErrorMessage_();
  expectEq(this.dataRequest.validationErrorMessage, expectedErrorMessage);
};

DataRequestTest.prototype
    .testValidateThrowsErrorForMultipleIssues = function() {
  this.dataRequest.request.fields = [
    {name: 'date'},
    {name: 'creativeId'},
    {name: 'bids'},
  ];
  this.dataRequest.request.dimensionsFilters = [
    [{
      fieldName: 'dealId',
      values: ['1234'],
      type: 'EXCLUDE',
      operator: 'CONTAINS'
    }],
    [{
      fieldName: 'format',
      values: ['AUDIO'],
      type: 'INCLUDE',
      operator: 'EQUALS'
    }]
  ];

  const expectedErrorMessage = 'The requested filters are not supported. ' +
      'Please correct the following issues and try again: (1) Only filter ' +
      'type INCLUDE is supported for dimensions creativeId, dealId; (2) Only ' +
      'filter operators EQUALS, IN_LIST are supported for dimensions ' +
      'creativeId, dealId; (3) Filter value for dimension format must be one ' +
      'of NATIVE_DISPLAY, NATIVE_VIDEO, NON_NATIVE_DISPLAY, ' +
      'NON_NATIVE_VIDEO; (4) Filter-only dimension creativeId requested ' +
      'without a corresponding filter';

  this.dataRequest.validate_();
  this.dataRequest.updateValidationErrorMessage_();
  expectEq(this.dataRequest.validationErrorMessage, expectedErrorMessage);
};
