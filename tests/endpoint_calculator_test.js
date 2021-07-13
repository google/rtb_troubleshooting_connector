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

/** Tests for the EndpointCalculator class. */
class EndpointCalculatorTest {
  constructor() {
    const genericRequest = {
      scriptParams: {lastRefresh: '1577836800000'},
      configParams: {bidderAccountId: '12345678'}
    };
    this.endpointCalculator = new EndpointCalculator(genericRequest);
  }
}
registerTestSuite(EndpointCalculatorTest);

EndpointCalculatorTest.prototype
    .testGetRequiredEndpointsOneMetric = function() {
  this.endpointCalculator.request.fields = [
    {name: 'availableImpressions'}
  ];
  const actualResult = this.endpointCalculator.getRequiredEndpoints();
  const expectedResult = ['impressionMetrics'];
  expectThat(actualResult, elementsAre(expectedResult));
};

EndpointCalculatorTest.prototype
    .testGetRequiredEndpointsMultipleMetrics = function() {
  this.endpointCalculator.request.fields = [
    {name: 'availableImpressions'},
    {name: 'bidRequests'},
    {name: 'bids'}
  ];
  const actualResult = this.endpointCalculator.getRequiredEndpoints();
  const expectedResult = [
    'impressionMetrics',
    'bidResponseErrors',
    'filteredBidRequests',
    'bidMetrics',
    'filteredBids',
    'losingBids'
  ];
  expectThat(actualResult, elementsAre(expectedResult));
};

EndpointCalculatorTest.prototype
    .testAllMetricsInSchemaAreMapped = function() {
  const mappedMetricNames = Object.keys(EndpointCalculator.metricEndpointMap_());
  const unmappedMetrics = getSchema().schema.filter(function(field) {
    return field.semantics.conceptType === 'METRIC' &&
        !mappedMetricNames.includes(field.name);
  });
  if (unmappedMetrics.length > 0) {
    log('The following metrics exist in the schema but are not mapped in ' +
        'EndpointCalculator.metricEndpointMap_: ' +
        unmappedMetrics.map(metric => metric.name).join(', '));
  }
  expectThat(unmappedMetrics.length, equals(0));
};
