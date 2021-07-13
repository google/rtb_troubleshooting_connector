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

/** Tests for the Api class. */
class ApiTest {
  constructor() {
    UrlFetchApp.fetch = createMockFunction();
    this.api = new Api('fakeOAuthToken');
    this.filterSet = fakeData.filterSets()['noFilters'];
  }
}
registerTestSuite(ApiTest);

ApiTest.prototype.testCreateFilterSetRequestIsWellFormed = function() {
  const expectedUrl = 'https://adexchangebuyer.googleapis.com/v2beta1/' +
      'bidders/12345678/filterSets?isTransient=true';
  const expectedOptions = {
    method: 'post',
    headers: {Authorization: `Bearer ${this.api.authToken}`},
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify(this.filterSet)
  };

  const fakeApiResponse = new HttpResponse(200, '');
  expectCall(UrlFetchApp.fetch)
      (expectedUrl, recursivelyEquals(expectedOptions))
      .willOnce(returnWith(fakeApiResponse));
  this.api.createFilterSet(this.filterSet);
};

ApiTest.prototype.testDeleteFilterSetRequestIsWellFormed = function() {
  const expectedUrl = 'https://adexchangebuyer.googleapis.com/v2beta1/' +
      this.filterSet.name;
  const expectedOptions = {
    method: 'delete',
    headers: {Authorization: `Bearer ${this.api.authToken}`},
    muteHttpExceptions: true
  };

  const fakeApiResponse = new HttpResponse(200, '');
  expectCall(UrlFetchApp.fetch)
      (expectedUrl, recursivelyEquals(expectedOptions))
      .willOnce(returnWith(fakeApiResponse));
  this.api.deleteFilterSet(this.filterSet);
};

ApiTest.prototype.testGetApiRowsWithSinglePage = function() {
  const endpoint = 'bidMetrics';
  const fakeBidMetricsRows = [
    {
      bids: {value: 5},
      bidsInAuction: {value: 4},
      billedImpressions: {value: 3},
      impressionsWon: {value: 3},
      measurableImpressions: {value: 2},
      rowDimensions: {
        timeInterval: {
          endTime: '2020-01-02T08:00:00Z',
          startTime: '2020-01-01T08:00:00Z'
        }
      }
    },
    {
      bids: {value: 10},
      bidsInAuction: {value: 8},
      billedImpressions: {value: 6},
      impressionsWon: {value: 6},
      measurableImpressions: {value: 4},
      rowDimensions: {
        timeInterval: {
          endTime: '2020-01-03T08:00:00Z',
          startTime: '2020-01-02T08:00:00Z'
        }
      }
    },
  ];
  this.api.listMetrics_ = createMockFunction();
  expectCall(this.api.listMetrics_)
      (this.filterSet, endpoint, null)
      .willOnce(returnWith({bidMetricsRows: fakeBidMetricsRows}));

  const expectedResult = fakeBidMetricsRows;
  const actualResult = this.api.getApiRows(this.filterSet, endpoint);
  expectThat(actualResult, recursivelyEquals(expectedResult));
};

ApiTest.prototype.testGetApiRowsWithMultiplePages = function() {
  const endpoint = 'bidMetrics';

  const fakeBidMetricsRowsPageOne = [
    {
      bids: {value: 5},
      bidsInAuction: {value: 4},
      billedImpressions: {value: 3},
      impressionsWon: {value: 3},
      measurableImpressions: {value: 2},
      rowDimensions: {
        timeInterval: {
          endTime: '2020-01-02T08:00:00Z',
          startTime: '2020-01-01T08:00:00Z'
        }
      }
    },
    {
      bids: {value: 10},
      bidsInAuction: {value: 8},
      billedImpressions: {value: 6},
      impressionsWon: {value: 6},
      measurableImpressions: {value: 4},
      rowDimensions: {
        timeInterval: {
          endTime: '2020-01-03T08:00:00Z',
          startTime: '2020-01-02T08:00:00Z'
        }
      }
    },
  ];

  const fakeBidMetricsRowsPageTwo = [
    {
      bids: {value: 5},
      bidsInAuction: {value: 4},
      billedImpressions: {value: 3},
      impressionsWon: {value: 3},
      measurableImpressions: {value: 2},
      rowDimensions: {
        timeInterval: {
          endTime: '2020-01-04T08:00:00Z',
          startTime: '2020-01-03T08:00:00Z'
        }
      }
    },
    {
      bids: {value: 10},
      bidsInAuction: {value: 8},
      billedImpressions: {value: 6},
      impressionsWon: {value: 6},
      measurableImpressions: {value: 4},
      rowDimensions: {
        timeInterval: {
          endTime: '2020-01-05T08:00:00Z',
          startTime: '2020-01-04T08:00:00Z'
        }
      }
    },
  ];

  this.api.listMetrics_ = createMockFunction();
  expectCall(this.api.listMetrics_)
      (this.filterSet, endpoint, null)
      .willOnce(returnWith({
        bidMetricsRows: fakeBidMetricsRowsPageOne,
        nextPageToken: 'pageTwo'
      }));
  expectCall(this.api.listMetrics_)
      (this.filterSet, endpoint, 'pageTwo')
      .willOnce(returnWith({
        bidMetricsRows: fakeBidMetricsRowsPageTwo
      }));

  const expectedResult =
      [...fakeBidMetricsRowsPageOne, ...fakeBidMetricsRowsPageTwo];
  const actualResult = this.api.getApiRows(this.filterSet, endpoint);
  expectThat(actualResult, recursivelyEquals(expectedResult));
};

ApiTest.prototype.testGetApiRowsWithEmptyLastPage = function() {
  const endpoint = 'bidMetrics';

  const fakeBidMetricsRowsPageOne = [
    {
      bids: {value: 5},
      bidsInAuction: {value: 4},
      billedImpressions: {value: 3},
      impressionsWon: {value: 3},
      measurableImpressions: {value: 2},
      rowDimensions: {
        timeInterval: {
          endTime: '2020-01-02T08:00:00Z',
          startTime: '2020-01-01T08:00:00Z'
        }
      }
    },
    {
      bids: {value: 10},
      bidsInAuction: {value: 8},
      billedImpressions: {value: 6},
      impressionsWon: {value: 6},
      measurableImpressions: {value: 4},
      rowDimensions: {
        timeInterval: {
          endTime: '2020-01-03T08:00:00Z',
          startTime: '2020-01-02T08:00:00Z'
        }
      }
    },
  ];

  const fakeBidMetricsRowsPageTwo = [
    {
      bids: {value: 5},
      bidsInAuction: {value: 4},
      billedImpressions: {value: 3},
      impressionsWon: {value: 3},
      measurableImpressions: {value: 2},
      rowDimensions: {
        timeInterval: {
          endTime: '2020-01-04T08:00:00Z',
          startTime: '2020-01-03T08:00:00Z'
        }
      }
    },
    {
      bids: {value: 10},
      bidsInAuction: {value: 8},
      billedImpressions: {value: 6},
      impressionsWon: {value: 6},
      measurableImpressions: {value: 4},
      rowDimensions: {
        timeInterval: {
          endTime: '2020-01-05T08:00:00Z',
          startTime: '2020-01-04T08:00:00Z'
        }
      }
    },
  ];

  this.api.listMetrics_ = createMockFunction();
  expectCall(this.api.listMetrics_)
      (this.filterSet, endpoint, null)
      .willOnce(returnWith({
        bidMetricsRows: fakeBidMetricsRowsPageOne,
        nextPageToken: 'pageTwo'
      }));
  expectCall(this.api.listMetrics_)
      (this.filterSet, endpoint, 'pageTwo')
      .willOnce(returnWith({
        bidMetricsRows: fakeBidMetricsRowsPageTwo,
        nextPageToken: 'pageThree'
      }));
  expectCall(this.api.listMetrics_)
      (this.filterSet, endpoint, 'pageThree')
      .willOnce(returnWith({
        bidMetricsRows: []
      }));

  const expectedResult =
      [...fakeBidMetricsRowsPageOne, ...fakeBidMetricsRowsPageTwo];
  const actualResult = this.api.getApiRows(this.filterSet, endpoint);
  expectThat(actualResult, recursivelyEquals(expectedResult));
};

ApiTest.prototype.testThrowsErrorsForQuotaExceeded = function() {
  const fakeApiResponse = new HttpResponse(429, '{}');
  expectCall(UrlFetchApp.fetch)
      (_, _)
      .times(3)
      .willRepeatedly(returnWith(fakeApiResponse));

  const expectedErrorMessage = Api.quotaExhaustedError_();
  throwConnectorError = createMockFunction();
  expectCall(throwConnectorError)
      (expectedErrorMessage, fakeApiResponse.getContentText())
      .times(3);
  this.api.createFilterSet(this.filterSet);
  this.api.deleteFilterSet(this.filterSet);
  this.api.getApiRows(this.filterSet, '');
};
