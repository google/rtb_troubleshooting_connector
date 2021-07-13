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

/** Tests for the FilterSetCalculator class. */
class FilterSetCalculatorTest {
  constructor() {
    const genericRequest = {
      scriptParams: {lastRefresh: '1577836800000'},
      configParams: {bidderAccountId: '12345678'}
    };
    this.filterSetCalculator = new FilterSetCalculator(genericRequest);

    FilterSetCalculator.getCurrentDateString_ = createMockFunction();
    expectCall(FilterSetCalculator.getCurrentDateString_)().willRepeatedly(
        returnWith('2020-01-01'));
  }

  /**
   * Adds a creative ID filter to the supplied filterSet.
   *
   * @param {!Object<string, *>} filterSet The filterSet to which a creative ID
   * filter should be added.
   * @param {string} creativeId The ID of the creative.
   * @return {!Object<string, *>} The filterSet with the creative ID filter.
   */
  static addCreativeFilter(filterSet, creativeId) {
    filterSet.name =
        filterSet.name.replace('creative-ALL', 'creative-' + creativeId);
    filterSet.creativeId = creativeId;
    return filterSet;
  };
}
registerTestSuite(FilterSetCalculatorTest);

FilterSetCalculatorTest
    .prototype.testGetRequiredFilterSetsNoFilterSetDimensions = function() {
  this.filterSetCalculator.request.fields = [
    {name: 'filteredByPretargeting'},
    {name: 'availableImpressions'}
  ];
  const actualResult = this.filterSetCalculator.getRequiredFilterSets();
  const expectedResult = [fakeData.filterSets()['noFilters']];
  expectThat(actualResult, recursivelyEquals(expectedResult));
};

FilterSetCalculatorTest.prototype
    .testGetRequiredFilterSetsOneFilterSetDimension = function() {
  this.filterSetCalculator.request.fields = [
    {name: 'environment'},
    {name: 'bids'}
  ];
  const actualResult = this.filterSetCalculator.getRequiredFilterSets();
  const expectedResult = [
    fakeData.filterSets()['app'],
    fakeData.filterSets()['web']
  ];
  expectThat(actualResult, recursivelyEquals(expectedResult));
};

FilterSetCalculatorTest.prototype
    .testGetRequiredFilterSetsOneFilter = function() {
  const creativeId = 'abc123';
  this.filterSetCalculator.request.fields = [
    {name: 'creativeId', forFilterOnly: true},
    {name: 'bids'}
  ];
  this.filterSetCalculator.request.dimensionsFilters = [[{
      fieldName: 'creativeId',
      type: 'INCLUDE',
      operator: 'EQUALS',
      values: [creativeId]
    }]];
  const actualResult = this.filterSetCalculator.getRequiredFilterSets();
  const expectedResult = [
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['noFilters'], creativeId)
  ];
  expectThat(actualResult, recursivelyEquals(expectedResult));
};

FilterSetCalculatorTest.prototype
    .testGetRequiredFilterSetsMultipleDimensionsAndFilter = function() {
  const creativeId = 'abc123';
  this.filterSetCalculator.request.fields = [
    {name: 'creativeId', forFilterOnly: true},
    {name: 'environment'},
    {name: 'format'},
    {name: 'platform'},
    {name: 'bids'}
  ];
  this.filterSetCalculator.request.dimensionsFilters = [[{
      fieldName: 'creativeId',
      type: 'INCLUDE',
      operator: 'EQUALS',
      values: [creativeId]
    }]];

  const expectedResult = [
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNativeDisplayDesktop'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNativeDisplayMobile'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNativeDisplayTablet'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNativeVideoDesktop'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNativeVideoMobile'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNativeVideoTablet'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNonNativeDisplayDesktop'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNonNativeDisplayMobile'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNonNativeDisplayTablet'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNonNativeVideoDesktop'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNonNativeVideoMobile'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['appNonNativeVideoTablet'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNativeDisplayDesktop'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNativeDisplayMobile'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNativeDisplayTablet'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNativeVideoDesktop'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNativeVideoMobile'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNativeVideoTablet'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNonNativeDisplayDesktop'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNonNativeDisplayMobile'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNonNativeDisplayTablet'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNonNativeVideoDesktop'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNonNativeVideoMobile'], creativeId),
    FilterSetCalculatorTest.addCreativeFilter(
        fakeData.filterSets()['webNonNativeVideoTablet'], creativeId)
  ];
  const actualResult = this.filterSetCalculator.getRequiredFilterSets();
  expectThat(actualResult, recursivelyEquals(expectedResult));
};

FilterSetCalculatorTest.prototype
    .testThrowsErrorForTooManyFilterSets = function() {
  this.filterSetCalculator.request.fields = [
    {name: 'creativeId', forFilterOnly: true},
    {name: 'environment'},
    {name: 'format'},
    {name: 'platform'},
    {name: 'bids'}
  ];
  this.filterSetCalculator.request.dimensionsFilters = [[{
      fieldName: 'creativeId',
      type: 'INCLUDE',
      operator: 'IN_LIST',
      values: ['abc123', 'def456']
    }]];

  const expectedNumFilterSetsNeeded = 48;
  const expectedMaxNumFilterSets = 24;
  const expectedErrorMessage =
      FilterSetCalculator.tooManyFilterSetsError_(
          expectedNumFilterSetsNeeded, expectedMaxNumFilterSets);
  throwConnectorError = createMockFunction();
  expectCall(throwConnectorError)(
      expectedErrorMessage, this.filterSetCalculator.request);

  this.filterSetCalculator.getRequiredFilterSets();
};
