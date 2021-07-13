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
 * Class to convert a single row from the API into one or more rows suitable for
 * Data Studio.
 */
class RowProcessor {
  /**
   * @param {!Object<string, *>} filterSet The filterSet used when retrieving
   *     the apiRow.
   * @param {string} endpoint The endpoint from which the apiRow was retrieved.
   * @param {!Object<string, *>} apiRow A row of data retrieved from the API.
   * @param {!Array<!Field>} requestSchema The fields requested by Data Studio.
   * @param {!Object<string, !Object<string, string>>} rtbDictionaries A
   *     collection of RTB dictionaries.
   */
  constructor(filterSet, endpoint, apiRow, requestSchema, rtbDictionaries) {
    this.endpoint = endpoint;
    this.apiRow = apiRow;
    // The kind of row (e.g., BidMetricsRow, ImpressionMetricsRow, etc.)
    this.rowType = constants.ENDPOINT_METRIC_OBJECT_MAP[endpoint];

    this.calloutStatusMap = rtbDictionaries['callout-status-codes.txt'];
    this.creativeStatusMap = rtbDictionaries['creative-status-codes.txt'];

    // When you request a daily breakdown from the API, it chunks data into PT
    // days as described by UTC boundaries. For example, the PT day 2020-01-01
    // would be encoded as:
    //
    //     timeInterval: {
    //       startTime: '2020-01-01T08:00:00Z'
    //       endTime: '2020-01-02T08:00:00Z',
    //     }
    //
    // Accordingly, we extract the date for the row from startTime because that
    // is when the UTC date will be the same as the PT date.
    const startDate =
        new Date(Date.parse(apiRow.rowDimensions.timeInterval.startTime));

    // Some fields will have the same value in all processed rows. Here we
    // extract those fields if requested so we can prepopulate rows to which
    // other fields will be added.
    this.commonFields = [];
    this.requestSchemaMinusCommonFields = [];
    for (const requestedField of requestSchema) {
      switch (requestedField.name) {
        case 'date':
          // Render in YYYYMMDD form in line with YEAR_MONTH_DAY data type.
          this.commonFields.push(
              startDate.toISOString().slice(0, 10).replace(/-/g, ''));
          break;
        case 'format':
          // FilterSetCalculator will always either leave filterSets.formats
          // unset or populate it with a single element.
          this.commonFields.push((filterSet.formats || [])[0]);
          break;
        case 'environment':
          this.commonFields.push(filterSet.environment);
          break;
        case 'platform':
          // FilterSetCalculator will always either leave filterSets.platforms
          // unset or populate it with a single element.
          this.commonFields.push((filterSet.platforms || [])[0]);
          break;
        case 'creativeId':
          this.commonFields.push(filterSet.creativeId);
          break;
        case 'dealId':
          this.commonFields.push(filterSet.dealId);
          break;
        // If we end up here, the requested field is not a common field and
        // should be extracted in emitProcessedRow_.
        default:
          this.requestSchemaMinusCommonFields.push(requestedField);
      }
    }

    this.processedRows = [];
  }

  /**
   * Returns the processed rows corresponding to the apiRow supplied in the
   * constructor.
   *
   * @return {!Array<*>} The processed rows.
   */
  getProcessedRows() {
    switch (this.rowType) {
      case 'bidMetricsRows':
        this.processBidMetricsRow_();
        break;
      case 'calloutStatusRows':
        this.processCalloutStatusRow_();
        break;
      case 'creativeStatusRows':
        this.processCreativeStatusRow_();
        break;
      case 'impressionMetricsRows':
        this.processImpressionMetricsRow_();
        break;
      case 'nonBillableWinningBidStatusRows':
        this.processNonBillableWinningBidStatusRow_();
        break;
    }
    return this.processedRows;
  }

  /**
   * Converts metrics derivable from BidMetricsRows into metrics exposed by the
   * connector.
   *
   * @private
   */
  processBidMetricsRow_() {
    if ((this.apiRow.impressionsWon || {}).value) {
      this.emitProcessedRow_({
        creativeStatusId: 1,
        creativeStatus: this.creativeStatusMap['1'],
        bids: +this.apiRow.impressionsWon.value,
        bidsInAuction: +this.apiRow.impressionsWon.value
      });
    }
    if ((this.apiRow.billedImpressions || {}).value) {
      this.emitProcessedRow_({
        wonImpressionStatus: 'BILLED',
        impressionsWon: +this.apiRow.billedImpressions.value,
        reachedQueries: +this.apiRow.billedImpressions.value
      });
    }
    if ((this.apiRow.viewableImpressions || {}).value) {
      this.emitProcessedRow_({
        viewabilityStatus: 'VIEWABLE',
        billedImpressions: +this.apiRow.viewableImpressions.value,
        measurableImpressions: +this.apiRow.viewableImpressions.value,
        viewableImpressions: +this.apiRow.viewableImpressions.value
      });
    }
    if ((this.apiRow.measurableImpressions || {}).value &&
        (this.apiRow.viewableImpressions || {}).value) {
      const notViewableImpressions = +this.apiRow.measurableImpressions.value -
          +this.apiRow.viewableImpressions.value;
      this.emitProcessedRow_({
        viewabilityStatus: 'NOT_VIEWABLE',
        billedImpressions: notViewableImpressions,
        measurableImpressions: notViewableImpressions
      });
    }
    if ((this.apiRow.billedImpressions || {}).value &&
        (this.apiRow.measurableImpressions || {}).value) {
      this.emitProcessedRow_({
        viewabilityStatus: 'NOT_MEASURABLE',
        billedImpressions: +this.apiRow.billedImpressions.value -
            +this.apiRow.measurableImpressions.value
      });
    }
  }

  /**
   * Converts metrics derivable from CalloutStatusRows into metrics exposed by
   * the connector.
   *
   * @private
   */
  processCalloutStatusRow_() {
    const processedRow = {};
    if (this.apiRow.calloutStatusId &&
        (this.apiRow.impressionCount || {}).value) {
      const impressionCount = +this.apiRow.impressionCount.value;
      processedRow.calloutStatusId = +this.apiRow.calloutStatusId;
      processedRow.calloutStatus =
          this.calloutStatusMap[this.apiRow.calloutStatusId];
      processedRow.bidRequests = impressionCount;
      switch (this.endpoint) {
        case 'bidResponseErrors':
          processedRow.bidResponseErrors = impressionCount;
          processedRow.sentBidRequests = impressionCount;
          break;
        case 'filteredBidRequests':
          processedRow.filteredBidRequests = impressionCount;
          break;
      }
    }
    if (Object.keys(processedRow).length > 0) {
      this.emitProcessedRow_(processedRow);
    }
  }

  /**
   * Converts metrics derivable from CreativeStatusRows into metrics exposed by
   * the connector.
   *
   * @private
   */
  processCreativeStatusRow_() {
    const processedRow = {};
    if (this.apiRow.creativeStatusId &&
        (this.apiRow.bidCount || {}).value) {
      const bidCount = +this.apiRow.bidCount.value;
      processedRow.creativeStatusId = +this.apiRow.creativeStatusId;
      processedRow.creativeStatus =
          this.creativeStatusMap[this.apiRow.creativeStatusId];
      processedRow.bids = bidCount;
      switch (this.endpoint) {
        case 'losingBids':
          processedRow.bidsInAuction = bidCount;
          processedRow.losingBids = bidCount;
          break;
        case 'filteredBids':
          processedRow.filteredBids = bidCount;
          break;
      }
    }
    if (Object.keys(processedRow).length > 0) {
      this.emitProcessedRow_(processedRow);
    }
  }

  /**
   * Converts metrics derivable from ImpressionMetricsRows into metrics exposed
   * by the connector.
   *
   * @private
   */
  processImpressionMetricsRow_() {
    if ((this.apiRow.inventoryMatches || {}).value) {
      this.emitProcessedRow_({
        filteredByPretargeting: false,
        availableImpressions: +this.apiRow.inventoryMatches.value,
        inventoryMatches: +this.apiRow.inventoryMatches.value
      });
    }
    if ((this.apiRow.inventoryMatches || {}).value &&
        (this.apiRow.availableImpressions || {}).value) {
      this.emitProcessedRow_({
        filteredByPretargeting: true,
        availableImpressions: +this.apiRow.availableImpressions.value -
            +this.apiRow.inventoryMatches.value
      });
    }
    const processedRowForBidRequestMetrics = {
      calloutStatusId: 1,
      calloutStatus: this.calloutStatusMap['1']
    };
    if ((this.apiRow.successfulResponses || {}).value) {
      const successfulResponses = +this.apiRow.successfulResponses.value;
      processedRowForBidRequestMetrics.bidRequests = successfulResponses;
      processedRowForBidRequestMetrics.sentBidRequests = successfulResponses;
      processedRowForBidRequestMetrics.successfulResponses =
          successfulResponses;
    }
    if ((this.apiRow.responsesWithBids || {}).value) {
      const responsesWithBids = +this.apiRow.responsesWithBids.value;
      processedRowForBidRequestMetrics.bidResponsesWithBids = responsesWithBids;
    }
    if (Object.keys(processedRowForBidRequestMetrics).length > 2) {
      this.emitProcessedRow_(processedRowForBidRequestMetrics);
    }
  }

  /**
   * Converts metrics derivable from NonBillableWinningBidStatusRows into
   * metrics exposed by the connector.
   *
   * @private
   */
  processNonBillableWinningBidStatusRow_() {
    const processedRow = {};
    if (this.apiRow.status && (this.apiRow.bidCount || {}).value) {
      const bidCount = +this.apiRow.bidCount.value;
      processedRow.wonImpressionStatus = this.apiRow.status;
      processedRow.impressionsWon = bidCount;
      processedRow.nonBillableWinningBids = bidCount;
      if (this.apiRow.status !== 'LOST_IN_MEDIATION') {
        processedRow.reachedQueries = bidCount;
      }
    }
    if (Object.keys(processedRow).length > 0) {
      this.emitProcessedRow_(processedRow);
    }
  }

  /**
   * Creates rows in the format required by Data Studio.
   *
   * @param {!Object<string, *>} fieldsToSet Maps fields that should have a
   *     value other than null or a default to the value they should have.
   * @private
   */
  emitProcessedRow_(fieldsToSet) {
    const row = [...this.commonFields];
    let metricsRequested = false;
    let truthyMetricsFoundInRow = false;

    for (const requestedField of this.requestSchemaMinusCommonFields) {
      let valueFoundForField = false;

      let requestedFieldIsMetric = false;
      if (requestedField.semantics.conceptType === 'METRIC') {
        requestedFieldIsMetric = true;
        metricsRequested = true;
      }

      for (const fieldName in fieldsToSet) {
        if (requestedField.name === fieldName) {
          row.push(fieldsToSet[fieldName]);
          if (requestedFieldIsMetric && fieldsToSet[fieldName] > 0) {
            truthyMetricsFoundInRow = true;
          }
          valueFoundForField = true;
        }
      }

      // Insert null for the field if we did not find an actual value.
      if (!valueFoundForField) {
        row.push(null);
      }
    }

    // Only keep rows where (1) there is at least one non-null value; and (2) if
    // metrics were requested, there is at least one non-null metric.
    let truthyValuesFoundInRow = row.filter(value => value).length > 0;
    if (truthyValuesFoundInRow &&
        (!metricsRequested || (metricsRequested && truthyMetricsFoundInRow))) {
      this.processedRows.push({values: row});
    }
  }
}
