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

/** Tests for the RowProcessor class. */
class RowProcessorTest {
  constructor() {
    this.filterSet = fakeData.filterSets()['noFilters'];

    this.rtbDictionaries = {
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
  }

  /**
   * Returns the Field objects in the connector schema that correspond to the
   * supplied fieldNames.
   *
   * https://developers.google.com/apps-script/reference/data-studio/field
   *
   * @param {!Array<string>} fieldNames The names of the Fields to retrieve.
   * @return {!Array<!Field>} The requested Fields.
   * @private
   */
  static getRequestSchema_(fieldNames) {
    return fieldNames.map(function(fieldName) {
      for (const field of getSchema().schema) {
        if (field.name === fieldName) {
          return field;
        }
      }
    });
  }
}
registerTestSuite(RowProcessorTest);

RowProcessorTest.prototype.testProcessBidMetricsRow = function() {
  const endpoint = 'bidMetrics';
  const apiRow = {
    bids: {value: '5'},
    bidsInAuction: {value: '4'},
    billedImpressions: {value: '3'},
    impressionsWon: {value: '3'},
    measurableImpressions: {value: '2'},
    viewableImpressions: {value: '1'},
    rowDimensions: {
      timeInterval: {
        endTime: '2020-01-02T08:00:00Z',
        startTime: '2020-01-01T08:00:00Z'
      }
    }
  };

  const requestSchema = RowProcessorTest.getRequestSchema_([
    'creativeStatusId',
    'creativeStatus',
    'bids',
    'bidsInAuction',
    'wonImpressionStatus',
    'impressionsWon',
    'reachedQueries',
    'viewabilityStatus',
    'billedImpressions',
    'measurableImpressions',
    'viewableImpressions'
  ]);

  // Values within each row are ordered as above.
  const expectedResult = [
    {values:[1,'Creative won the auction',3,3,null,null,null,null,null,null,null ]},
    {values:[null,null,null,null,'BILLED',3,3,null,null,null,null ]},
    {values:[null,null,null,null,null,null,null,'VIEWABLE',1,1,1 ]},
    {values:[null,null,null,null,null,null,null,'NOT_VIEWABLE',1,1,null ]},
    {values:[null,null,null,null,null,null,null,'NOT_MEASURABLE',1,null,null ]}
  ];

  const rowProcessor =
      new RowProcessor(this.filterSet, endpoint, apiRow, requestSchema,
                       this.rtbDictionaries);
  const actualResult = rowProcessor.getProcessedRows();

  expectThat(actualResult, recursivelyEquals(expectedResult));
};

RowProcessorTest.prototype.testProcessImpressionMetricsRow = function() {
  const endpoint = 'impressionMetrics';
  const apiRow = {
    availableImpressions: {value: '10'},
    inventoryMatches: {value: '4'},
    bidRequests: {value: '3'},
    successfulResponses: {value: '2'},
    responsesWithBids: {value: '1'},
    rowDimensions: {
      timeInterval: {
        endTime: '2020-01-02T08:00:00Z',
        startTime: '2020-01-01T08:00:00Z'
      }
    }
  };

  const requestSchema = RowProcessorTest.getRequestSchema_([
    'filteredByPretargeting',
    'availableImpressions',
    'inventoryMatches',
    'calloutStatusId',
    'calloutStatus',
    'bidRequests',
    'sentBidRequests',
    'successfulResponses',
    'bidResponsesWithBids'
  ]);

  // Values within each row are ordered as above.
  const expectedResult = [
    {values:[false,4,4,null,null,null,null,null,null]},
    {values:[true,6,null,null,null,null,null,null,null]},
    {values:[null,null,null,1,'Callout successful.',2,2,2,1]}
  ];

  const rowProcessor =
      new RowProcessor(this.filterSet, endpoint, apiRow, requestSchema,
                       this.rtbDictionaries);
  const actualResult = rowProcessor.getProcessedRows();

  expectThat(actualResult, recursivelyEquals(expectedResult));
};

RowProcessorTest.prototype
    .testProcessCalloutStatusRowBidResponseErrors = function() {
  const endpoint = 'bidResponseErrors';
  const apiRow = {
    impressionCount: {value: '10'},
    calloutStatusId: 7,
    rowDimensions: {
      timeInterval: {
        endTime: '2020-01-02T08:00:00Z',
        startTime: '2020-01-01T08:00:00Z'
      }
    }
  };

  const requestSchema = RowProcessorTest.getRequestSchema_([
    'calloutStatusId',
    'calloutStatus',
    'bidResponseErrors',
    'sentBidRequests'
  ]);

  // Values within each row are ordered as above.
  const expectedResult = [
    {values:[7,'Callout HTTP request timed out.',10,10]}
  ];

  const rowProcessor =
      new RowProcessor(this.filterSet, endpoint, apiRow, requestSchema,
                       this.rtbDictionaries);
  const actualResult = rowProcessor.getProcessedRows();

  expectThat(actualResult, recursivelyEquals(expectedResult));
};

RowProcessorTest.prototype
    .testProcessCalloutStatusRowFilteredBidRequests = function() {
  const endpoint = 'filteredBidRequests';
  const apiRow = {
    impressionCount: {value: '10'},
    calloutStatusId: 5,
    rowDimensions: {
      timeInterval: {
        endTime: '2020-01-02T08:00:00Z',
        startTime: '2020-01-01T08:00:00Z'
      }
    }
  };

  const requestSchema = RowProcessorTest.getRequestSchema_([
    'calloutStatusId',
    'calloutStatus',
    'filteredBidRequests'
  ]);

  // Values within each row are ordered as above.
  const expectedResult = [
    {values:[5,'Out of quota.',10]}
  ];

  const rowProcessor =
      new RowProcessor(this.filterSet, endpoint, apiRow, requestSchema,
                       this.rtbDictionaries);
  const actualResult = rowProcessor.getProcessedRows();

  expectThat(actualResult, recursivelyEquals(expectedResult));
};

RowProcessorTest.prototype
    .testProcessCreativeStatusRowFilteredBids = function() {
  const endpoint = 'filteredBids';
  const apiRow = {
    bidCount: {value: '10'},
    creativeStatusId: 10,
    rowDimensions: {
      timeInterval: {
        endTime: '2020-01-02T08:00:00Z',
        startTime: '2020-01-01T08:00:00Z'
      }
    }
  };

  const requestSchema = RowProcessorTest.getRequestSchema_([
    'creativeStatusId',
    'creativeStatus',
    'bids',
    'filteredBids'
  ]);

  // Values within each row are ordered as above.
  const expectedResult = [
    {values:[10,'Creative was not approved',10,10]}
  ];

  const rowProcessor =
      new RowProcessor(this.filterSet, endpoint, apiRow, requestSchema,
                       this.rtbDictionaries);
  const actualResult = rowProcessor.getProcessedRows();

  expectThat(actualResult, recursivelyEquals(expectedResult));
};

RowProcessorTest.prototype
    .testProcessCreativeStatusRowLosingBids = function() {
  const endpoint = 'losingBids';
  const apiRow = {
    bidCount: {value: '10'},
    creativeStatusId: 79,
    rowDimensions: {
      timeInterval: {
        endTime: '2020-01-02T08:00:00Z',
        startTime: '2020-01-01T08:00:00Z'
      }
    }
  };

  const requestSchema = RowProcessorTest.getRequestSchema_([
    'creativeStatusId',
    'creativeStatus',
    'bids',
    'bidsInAuction',
    'losingBids'
  ]);

  // Values within each row are ordered as above.
  const expectedResult = [
    {values:[79,'Creative was outbid',10,10,10]}
  ];

  const rowProcessor =
      new RowProcessor(this.filterSet, endpoint, apiRow, requestSchema,
                       this.rtbDictionaries);
  const actualResult = rowProcessor.getProcessedRows();

  expectThat(actualResult, recursivelyEquals(expectedResult));
};

RowProcessorTest.prototype
    .testProcessNonBillableWinningBidStatusRowAdNotRendered = function() {
  const endpoint = 'nonBillableWinningBids';
  const apiRow = {
    bidCount: {value: '10'},
    status: 'AD_NOT_RENDERED',
    rowDimensions: {
      timeInterval: {
        endTime: '2020-01-02T08:00:00Z',
        startTime: '2020-01-01T08:00:00Z'
      }
    }
  };

  const requestSchema = RowProcessorTest.getRequestSchema_([
    'wonImpressionStatus',
    'impressionsWon',
    'nonBillableWinningBids',
    'reachedQueries'
  ]);

  // Values within each row are ordered as above.
  const expectedResult = [
    {values:['AD_NOT_RENDERED',10,10,10]},
  ];

  const rowProcessor =
      new RowProcessor(this.filterSet, endpoint, apiRow, requestSchema,
                       this.rtbDictionaries);
  const actualResult = rowProcessor.getProcessedRows();

  expectThat(actualResult, recursivelyEquals(expectedResult));
};

RowProcessorTest.prototype
    .testProcessNonBillableWinningBidStatusRowLostInMediation = function() {
  const endpoint = 'nonBillableWinningBids';
  const apiRow = {
    bidCount: {value: '10'},
    status: 'LOST_IN_MEDIATION',
    rowDimensions: {
      timeInterval: {
        endTime: '2020-01-02T08:00:00Z',
        startTime: '2020-01-01T08:00:00Z'
      }
    }
  };

  const requestSchema = RowProcessorTest.getRequestSchema_([
    'wonImpressionStatus',
    'impressionsWon',
    'nonBillableWinningBids',
    'reachedQueries'
  ]);

  // Values within each row are ordered as above.
  const expectedResult = [
    {values:['LOST_IN_MEDIATION',10,10,null]}
  ];

  const rowProcessor =
      new RowProcessor(this.filterSet, endpoint, apiRow, requestSchema,
                       this.rtbDictionaries);
  const actualResult = rowProcessor.getProcessedRows();

  expectThat(actualResult, recursivelyEquals(expectedResult));
};
