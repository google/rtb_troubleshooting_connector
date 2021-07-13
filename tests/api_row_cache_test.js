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

/** Tests for the ApiRowCache class. */
class ApiRowCacheTest {
  constructor() {
    this.apiRowCache = new ApiRowCache();

    this.endpoint = 'bidMetrics';
    this.filterSet = fakeData.filterSets()['noFilters'];
    this.apiRows = [
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
  }
}
registerTestSuite(ApiRowCacheTest);

ApiRowCacheTest.prototype.testReturnsRowsAsCached = function() {
  this.apiRowCache.putApiRows(this.filterSet, this.endpoint, this.apiRows);
  expectThat(this.apiRowCache.getApiRows(this.filterSet, this.endpoint),
             recursivelyEquals(this.apiRows));
};

ApiRowCacheTest.prototype.testReturnsNullIfMasterKeyMissing = function() {
  this.apiRowCache.putApiRows(this.filterSet, this.endpoint, this.apiRows);
  delete
      this.apiRowCache.cache.cache[`${this.filterSet.name}_${this.endpoint}`];
  expectEq(null, this.apiRowCache.getApiRows(this.filterSet, this.endpoint));
};

ApiRowCacheTest.prototype.testReturnsNullIfDataRowMissing = function() {
  this.apiRowCache.putApiRows(this.filterSet, this.endpoint, this.apiRows);
  delete
      this.apiRowCache.cache.cache[`${this.filterSet.name}_${this.endpoint}_0`];
  expectEq(null, this.apiRowCache.getApiRows(this.filterSet, this.endpoint));
};
