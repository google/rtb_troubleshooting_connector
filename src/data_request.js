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

/** Class for responding to requests from Data Studio. */
class DataRequest {

  /**
   * @param {!Object<string, *>} request Data request parameters.
   * @param {boolean} retainFilterSets Whether filterSets should be retained at
   *     the end of the current request.
   * @param {boolean} disableCacheServing Whether serving data from a cache
   *     should be disabled.
   */
  constructor(request, retainFilterSets, disableCacheServing) {
    this.request = request;
    this.retainFilterSets = retainFilterSets;
    this.disableCacheServing = disableCacheServing;

    this.isValid = true;
    this.invalidReasons = new Set();
    this.validationErrorMessage = null;

    this.api = new Api(ScriptApp.getOAuthToken());
    this.rtbDictionaries = new RtbDictionaryCollection();
    this.filterSetCalculator =
        new FilterSetCalculator(this.request, this.retainFilterSets);
    this.endpointCalculator = new EndpointCalculator(this.request);
    this.apiRowCache = new ApiRowCache();
  }

  /**
   * Returns data requested by Data Studio.
   *
   * https://developers.google.com/datastudio/connector/reference#getdata
   *
   * @return {!GetDataResponse} Data for the given request.
   */
  getData() {
    this.validate_();
    if (!this.isValid) {
      this.updateValidationErrorMessage_();
      throwConnectorError(this.validationErrorMessage, this.request);
    }

    this.api.confirmAccountAccess(this.request.configParams.bidderAccountId);

    const rtbDictionaries = this.rtbDictionaries.getRtbDictionaries();
    const requiredFilterSets = this.filterSetCalculator.getRequiredFilterSets();
    const requiredEndpoints = this.endpointCalculator.getRequiredEndpoints();
    const userCache = CacheService.getUserCache();
    const requestSchema = this.getRequestSchema_();

    let requestData = [];
    for (const filterSet of requiredFilterSets) {
      for (const endpoint of requiredEndpoints) {
        let apiRows = this.apiRowCache.getApiRows(filterSet, endpoint);

        // If we cannot use cached data, ensure the filterSet exists, retrieve
        // data from the API, and then cache the data thus retrieved.
        if (!apiRows || this.disableCacheServing) {
          if (!userCache.get(filterSet.name)) {
            this.api.createFilterSet(filterSet);
            // Cache the filterSet name so we know it exists. Set 1-hour expiry
            // since transient filterSets are guaranteed to last only this long.
            userCache.put(filterSet.name, '', 3600);
          }
          apiRows = this.api.getApiRows(filterSet, endpoint);
          this.apiRowCache.putApiRows(filterSet, endpoint, apiRows);
        }

        // Deduplicate apiRows since the API sometimes returns duplicate rows.
        apiRows = DataRequest.deduplicateObjectArray_(apiRows);

        for (const apiRow of apiRows) {
          const rowProcessor = new RowProcessor(
              filterSet, endpoint, apiRow, requestSchema, rtbDictionaries);
          requestData = [...requestData, ...rowProcessor.getProcessedRows()];
        }
      }
      if (!this.retainFilterSets) {
        userCache.remove(filterSet.name);
        this.api.deleteFilterSet(filterSet);
      }
    }

    return {
      schema: requestSchema,
      rows: requestData,
      // Tell Data Studio we have not applied any filters. This is not strictly
      // true, as the connector applies creativeId and dealId filters, but
      // Data Studio will simply re-apply the same filters for these dimensions.
      // https://developers.google.com/datastudio/connector/reference#response_3
      filtersApplied: false
    };
  }

  /**
   * Runs a series of checks to confirm that the connector supports the supplied
   * data request parameters.
   *
   * @private
   */
  validate_() {
    const requestSchema = this.getRequestSchema_();

    const filterCountPerRequestedIdField = {};
    for (const field of requestSchema) {
      if (DataRequest.idFilterFieldNames_().includes(field.name)) {
        filterCountPerRequestedIdField[field.name] = 0;
      }
    }

    if (this.request.dimensionsFilters) {
      for (const dimension of this.request.dimensionsFilters) {
        for (const filter of dimension) {

          // For ID fields (e.g., creativeId), report an error if the user does
          // anything other than include one or more IDs. It is not practical to
          // support other kinds of filters.
          if (DataRequest.idFilterFieldNames_().includes(filter.fieldName)) {
            if (!DataRequest.validTypesForIdFilters_().includes(filter.type)) {
              this.isValid = false;
              this.invalidReasons.add(
                  DataRequest.invalidTypeForIdFilterError_());
            }
            if (!DataRequest.validOperatorsForIdFilters_()
                .includes(filter.operator)) {
              this.isValid = false;
              this.invalidReasons.add(
                  DataRequest.invalidOperatorForIdFilterError_());
            }
            filterCountPerRequestedIdField[filter.fieldName] += 1;
          }

          // Since the connector delegates filtering to Data Studio, this check
          // is not strictly necessary for the connector to function. However,
          // it prevents the user from filtering on an invalid value and thereby
          // seeing empty / misleading results.
          if (DataRequest.generalFilterFieldNames_()
              .includes(filter.fieldName)) {
            const requestedValues = filter.values;
            const validValues = FilterSetCalculator
                .dimensionNameToValuesMap()[filter.fieldName];
            const invalidRequestedValues = requestedValues.filter(
                requestedValue => !validValues.includes(requestedValue));
            if (invalidRequestedValues.length > 0) {
              this.isValid = false;
              this.invalidReasons.add(
                  DataRequest.invalidFilterValueError_(filter.fieldName));
            }
          }

        }
      }
    }

    const requestedIdFieldsWithoutFilters = new Set();
    const requestedIdFieldsWithMultipleFilters = new Set();
    for (const [key, value] of Object.entries(filterCountPerRequestedIdField)) {
      if (value === 0) {
        requestedIdFieldsWithoutFilters.add(key);
      } else if (value > 1) {
        requestedIdFieldsWithMultipleFilters.add(key);
      }
    }

    // Report an error if the user requests a filter-only dimension (a dimension
    // only available when a filter is supplied) without supplying a filter.
    if (requestedIdFieldsWithoutFilters.size > 0) {
      this.isValid = false;
      this.invalidReasons.add(
          DataRequest.idFieldsRequestedWithoutFiltersError_(
              requestedIdFieldsWithoutFilters));
    }

    // Report an error if the user supplies more than one filter for a
    // filter-only dimension (a dimension only available when a filter is
    // supplied).
    if (requestedIdFieldsWithMultipleFilters.size > 0) {
      this.isValid = false;
      this.invalidReasons.add(
          DataRequest.idFieldsRequestedWithMultipleFiltersError_(
              requestedIdFieldsWithMultipleFilters));
    }
  }

  /**
   * Returns Field objects corresponding to the field names requested by Data
   * Studio. Fields in the return array are ordered as in the connector schema.
   *
   * https://developers.google.com/apps-script/reference/data-studio/field
   *
   * @return {!Array<!Field>} The fields requested by Data Studio.
   * @private
   */
  getRequestSchema_() {
    const requestedFieldNames = this.request.fields.map(requestedField => {
      return requestedField.name;
    });
    // Fields in the return array must be ordered as in the connector schema.
    return getSchema().schema.filter(availableField => {
      return requestedFieldNames.includes(availableField.name);
    });
  }

  /**
   * Generates an error message incorporating any issues identified during
   * validation.
   *
   * @private
   */
  updateValidationErrorMessage_() {
    if (this.invalidReasons.size <= 1) {
      this.validationErrorMessage = [...this.invalidReasons][0];
    } else {
      let invalidReasonsString = '';
      let i = 1;
      for (const reason of this.invalidReasons) {
        invalidReasonsString += ` (${i}) ${reason};`;
        i++;
      }
      this.validationErrorMessage = [
        'The requested filters are not supported. Please correct the ',
        'following issues and try again:',
        invalidReasonsString.slice(0, -1)
      ].join('');
    }
  }

  /**
   * Returns the names of dimensions that might appear in a filter and whose
   * values are IDs.
   *
   * @return {!Array<string>}
   * @private
   */
  static idFilterFieldNames_() {
    return ['creativeId', 'dealId'];
  }

  /**
   * Returns the names of dimensions that might appear in a filter and whose
   * values are enums.
   *
   * @return {!Array<string>}
   * @private
   */
  static generalFilterFieldNames_() {
    return ['environment', 'format', 'platform'];
  }

  /**
   * Returns the filter types supported for ID fields.
   *
   * @return {!Array<string>}
   * @private
   */
  static validTypesForIdFilters_() {
    return ['INCLUDE'];
  }

  /**
   * Returns the filter operators supported for ID fields.
   *
   * @return {!Array<string>}
   * @private
   */
  static validOperatorsForIdFilters_() {
    return ['EQUALS', 'IN_LIST'];
  }

  /**
   * Returns an error message that can be displayed to the end user when they
   * request an invalid filter type.
   *
   * @return {string}
   * @private
   */
  static invalidTypeForIdFilterError_() {
    const numTypes = DataRequest.validTypesForIdFilters_().length;
    const numDimensions = DataRequest.idFilterFieldNames_().length;
    return [
      'Only filter ',
      numTypes > 1 ? 'types ' : 'type ',
      DataRequest.validTypesForIdFilters_().join(', '),
      numTypes > 1 ? ' are ' : ' is ',
      'supported for ',
      numDimensions > 1 ? 'dimensions ' : 'dimension ',
      DataRequest.idFilterFieldNames_().join(', ')
    ].join('');
  }

  /**
   * Returns an error message that can be displayed to the end user when they
   * request an invalid filter operator.
   *
   * @return {string}
   * @private
   */
  static invalidOperatorForIdFilterError_() {
    const numOperators = DataRequest.validOperatorsForIdFilters_().length;
    const numDimensions = DataRequest.idFilterFieldNames_().length;
    return [
      'Only filter ',
      numOperators > 1 ? 'operators ' : 'operator ',
      DataRequest.validOperatorsForIdFilters_().join(', '),
      numOperators > 1 ? ' are ' : ' is ',
      'supported for ',
      numDimensions > 1 ? 'dimensions ' : 'dimension ',
      DataRequest.idFilterFieldNames_().join(', ')
    ].join('');
  }

  /**
   * Returns an error message that can be displayed to the end user when they
   * specify an invalid filter value.
   *
   * @param {string} fieldName The name of the field for which an invalid filter
   *     value was specified.
   * @return {string}
   * @private
   */
  static invalidFilterValueError_(fieldName) {
    return [
      'Filter value for dimension ',
      fieldName,
      ' must be one of ',
      FilterSetCalculator.dimensionNameToValuesMap()[fieldName].join(', ')
    ].join('');
  }

  /**
   * Returns an error message that can be displayed to the end user when they
   * request a filter-only dimension without a corresponding filter.
   *
   * @param {!Array<string>} fieldNames The names of filter-only dimensions that
   *     were requested without a corresponding filter.
   * @return {string}
   * @private
   */
  static idFieldsRequestedWithoutFiltersError_(fieldNames) {
    return [
      'Filter-only ',
      fieldNames.length > 1 ? 'dimensions ' : 'dimension ',
      [...fieldNames].join(', '),
      ' requested without ',
      fieldNames.length > 1 ? 'corresponding filters' : 'a corresponding filter'
    ].join('');
  }

  /**
   * Returns an error message that can be displayed to the end user when they
   * request a filter-only dimension with multiple filters.
   *
   * @param {!Array<string>} fieldNames The names of filter-only dimensions that
   *     were requested with multiple filters.
   * @return {string}
   * @private
   */
  static idFieldsRequestedWithMultipleFiltersError_(fieldNames) {
    return [
      fieldNames.length > 1 ? 'Dimensions ' : 'Dimension ',
      [...fieldNames].join(', '),
      ' requested with multiple filters. Only one filter each is supported ',
      'for filter-only dimensions. Please remove any additional filters. If ',
      'you are trying to retrieve data for multiple IDs, please use a single ',
      'filter with the IN operator.'
    ].join('');
  }

  /**
   * Removes duplicates from an array of objects.
   *
   * @param {!Array<!Object>} objectArray The array of objects to be
   *     deduplicated.
   * @return {!Array<!Object>} The deduplicated array of objects.
   * @private
   */
  static deduplicateObjectArray_(objectArray) {
    const stringArray = objectArray.map((item) => JSON.stringify(item));
    const dedupedStringArray = Array.from(new Set(stringArray));
    const dedupedObjectArray =
        dedupedStringArray.map((item) => JSON.parse(item));
    return dedupedObjectArray;
  }
}
