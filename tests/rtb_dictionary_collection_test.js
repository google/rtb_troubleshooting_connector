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

/** Tests for the RtbDictionaryCollection class. */
class RtbDictionaryCollectionTest {
  constructor() {
    UrlFetchApp.fetch = createMockFunction();
    this.rtbDictionaryCollection = new RtbDictionaryCollection();
    this.rtbDictionaryCollection.cache = new Cache();
    this.expectedResult = {
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
}
registerTestSuite(RtbDictionaryCollectionTest);

RtbDictionaryCollectionTest.prototype
    .testGetRtbDictionaryCollectionOverNetwork = function() {
  const calloutStatusCodesUrl = 'https://storage.googleapis.com/' +
      'adx-rtb-dictionaries/callout-status-codes.txt';
  const creativeStatusCodesUrl = 'https://storage.googleapis.com/' +
      'adx-rtb-dictionaries/creative-status-codes.txt';
  const calloutStatusCodesFileContent = `1 Callout successful.
5 Out of quota.
7 Callout HTTP request timed out.`;
  const creativeStatusCodesFileContent = `1 Creative won the auction
10 Creative was not approved
79 Creative was outbid`;

  expectCall(UrlFetchApp.fetch)
      (calloutStatusCodesUrl, recursivelyEquals({muteHttpExceptions: false}))
      .willOnce(returnWith(
          new HttpResponse(200, calloutStatusCodesFileContent)));
  expectCall(UrlFetchApp.fetch)
      (creativeStatusCodesUrl, recursivelyEquals({muteHttpExceptions: false}))
      .willOnce(returnWith(
          new HttpResponse(200, creativeStatusCodesFileContent)));
  const actualResult = this.rtbDictionaryCollection.getRtbDictionaries();

  expectThat(actualResult, recursivelyEquals(this.expectedResult));
};

RtbDictionaryCollectionTest.prototype
    .testGetRtbDictionaryCollectionFromCache = function() {
  for (const filename of RtbDictionaryCollection.filenames_()) {
    this.rtbDictionaryCollection.cache.put(
        filename, JSON.stringify(this.expectedResult[filename]), 21600);
  }

  // We just populated the cache, so the upcoming call to getRtbDictionaries
  // should not result in any network calls.
  expectCall(UrlFetchApp.fetch)(_,_).times(0);
  const actualResult = this.rtbDictionaryCollection.getRtbDictionaries();

  expectThat(actualResult, recursivelyEquals(this.expectedResult));
};
