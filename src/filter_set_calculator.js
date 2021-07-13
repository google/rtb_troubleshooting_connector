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

/** Class for calculating the filterSets needed to fulfill a data request. */
class FilterSetCalculator {

  /**
   * @param {!Object<string, *>} request Data request parameters.
   * @param {boolean} [retainFilterSets=true] Whether filterSets should be
   *     retained at the end of the current request.
   */
  constructor(request, retainFilterSets=true) {
    this.request = request;
    this.retainFilterSets = retainFilterSets;
  }

  /**
   * Get the filterSets needed to retrieve metrics with the requested dimensions
   * and filters.
   *
   * https://developers.google.com/authorized-buyers/apis/reference/rest/v2beta1/bidders.accounts.filterSets
   *
   * @return {!Array<!Object<string, *>>} The required filterSets.
   */
  getRequiredFilterSets() {
    const result = [];

    const dimensionValues = this.getDimensionValues_();
    const creativeIdValues = this.getFilterValues_('creativeId');
    const dealIdValues = this.getFilterValues_('dealId');

    for (const environment of dimensionValues['environment']) {
      for (const format of dimensionValues['format']) {
        for (const platform of dimensionValues['platform']) {
          for (const creativeId of creativeIdValues) {
            for (const dealId of dealIdValues) {
              result.push(this.getFilterSetObject_(
                  environment, format, platform, creativeId, dealId));
            }
          }
        }
      }
    }

    // Set a limit on how many filterSets a request can generate to place a
    // reasonable cap on the number of API calls.
    const maxNumFilterSets =
        FilterSetCalculator.getNumDimensionValueCombinations_();
    if (result.length > maxNumFilterSets) {
      throwConnectorError(
          FilterSetCalculator.tooManyFilterSetsError_(
              result.length, maxNumFilterSets), this.request);
    }

    return result;
  }

  /**
   * Create a single filterSet using the supplied values.
   *
   * https://developers.google.com/authorized-buyers/apis/reference/rest/v2beta1/bidders.accounts.filterSets
   *
   * @param {string} environment The environment the filterSet should specify.
   * @param {string} format The format the filterSet should specify.
   * @param {string} platform The platform the filterSet should specify.
   * @param {string} creativeId The creativeIds the filterSet should specify.
   * @param {string} dealId The dealIds the filterSet should specify.
   * @return {!Object<string, *>} The filterSet.
   * @private
   */
  getFilterSetObject_(environment, format, platform, creativeId, dealId) {
    const result = {
      name: this.getFilterSetName_(
          environment, format, platform, creativeId, dealId),
      timeSeriesGranularity:
          FilterSetCalculator.defaultTimeSeriesGranularity_(),
      relativeDateRange: {
        offsetDays: FilterSetCalculator.defaultDateRangeOffsetDays_(),
        durationDays: FilterSetCalculator.defaultDateRangeDurationDays_()
      }
    };

    const placeholder = FilterSetCalculator.dimensionPlaceholder_();
    if (environment !== placeholder) {
      result.environment = environment;
    }
    if (format !== placeholder) {
      result.formats = [format];
    }
    if (platform !== placeholder) {
      result.platforms = [platform];
    }
    if (creativeId !== placeholder) {
      result.creativeId = creativeId;
    }
    if (dealId !== placeholder) {
      result.dealId = dealId;
    }
    return result;
  }

  /**
   * Create a name for a filterSet using the supplied values.
   *
   * https://developers.google.com/authorized-buyers/apis/reference/rest/v2beta1/bidders.accounts.filterSets
   *
   * @param {string} environment The environment specified in the filterSet.
   * @param {string} format The format specified in the filterSet.
   * @param {string} platform The platform specified in the filterSet.
   * @param {string} creativeId The creativeId specified in the filterSet.
   * @param {string} dealId The dealId specified in the filterSet.
   * @return {string} The filterSet name.
   * @private
   */
  getFilterSetName_(environment, format, platform, creativeId, dealId) {
    let timeString = FilterSetCalculator.getCurrentDateString_();
    // The API does not deal well with identical filterSets being created and
    // deleted many times in quick succession. Accordingly, if the user requests
    // that we not retain filterSets at the end of each request, we use a
    // timestamp instead of a date so that filterSets created for subsequent
    // requests will not be identical.
    if (!this.retainFilterSets) {
      timeString = String(new Date().getTime());
    }
    const prefix = [
      'bidders/',
      this.request.configParams.bidderAccountId,
      '/filterSets/rtb_troubleshooting_data_studio_connector_tmp'
    ].join('');
    const result = [
      prefix,
      timeString,
      `environment-${environment}`,
      `format-${format}`,
      `platform-${platform}`,
      `creative-${creativeId}`,
      `deal-${dealId}`
    ].join('_');
    return result;
  }

  /**
   * Maps requested dimensions to all their possible values and non-requested
   * dimensions to a placeholder value.
   *
   * @return {!Object<string, !Array<string>>} Map of dimensions to values.
   * @private
   */
  getDimensionValues_() {
    let result = {};
    const requestedFieldNames = this.request.fields.map(field => field.name);

    for (const fieldName in FilterSetCalculator.dimensionNameToValuesMap()) {
      if (requestedFieldNames.includes(fieldName)) {
        result[fieldName] =
            FilterSetCalculator.dimensionNameToValuesMap()[fieldName];
      } else {
        result[fieldName] = [FilterSetCalculator.dimensionPlaceholder_()];
      }
    }

    return result;
  }

  /**
   * Extract creative or deal IDs on which to filter. If none are requested,
   * return a placeholder.
   *
   * https://developers.google.com/datastudio/connector/filters
   *
   * @param {string} fieldName The field for which values should be extracted.
   * @return {!Array<string>} The extracted values or a placeholder.
   * @private
   */
  getFilterValues_(fieldName) {
    if (!this.request.dimensionsFilters) {
      return [FilterSetCalculator.dimensionPlaceholder_()];
    }

    let result = [];
    for (const dimension of this.request.dimensionsFilters) {
      if (dimension[0].fieldName === fieldName) {
        for (const filter of dimension) {
          for (const value of filter.values) {
            // IDs must be passed to the API as strings
            result.push(String(value));
          }
        }
      }
    }

    if (result.length === 0) {
      return [FilterSetCalculator.dimensionPlaceholder_()];
    }

    return [...new Set(result)];
  }

  /**
   * Generate a string representing the current date.
   *
   * @return {string} The current date in ISO string format.
   * @private
   */
  static getCurrentDateString_() {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * The default value to be used for filterSet.timeSeriesGranularity.
   *
   * @return {string} The default value for timeSeriesGranularity.
   * @private
   */
  static defaultTimeSeriesGranularity_() {
    return 'DAILY';
  }

  /**
   * The default value to be used for filterSet.relativeDateRange.offsetDays.
   *
   * @return {number} The default value for relativeDateRange.offsetDays.
   * @private
   */
  static defaultDateRangeOffsetDays_() {
    return 1;
  }

  /**
   * The default value to be used for filterSet.relativeDateRange.durationDays.
   *
   * @return {number} The default value for relativeDateRange.durationDays.
   * @private
   */
  static defaultDateRangeDurationDays_() {
    return 30;
  }

  /**
   * Placeholder to mark dimensions not requested.
   *
   * @return {string} The value to be used for dimensions not requested.
   * @private
   */
  static dimensionPlaceholder_() {
    return 'ALL';
  }

  /**
   * Calculates the number of dimension value combinations.
   *
   * @return {number} The number of combinations.
   * @private
   */
  static getNumDimensionValueCombinations_() {
    const map = FilterSetCalculator.dimensionNameToValuesMap();
    let result = 1;
    for (const dimension in map) {
      result = result * map[dimension].length;
    }
    return result;
  }

  /**
   * Map of dimensions to their possible values.
   *
   * @return {!Object<string, !Array<string>>} Map of dimensions to possible
   * values.
   */
  static dimensionNameToValuesMap() {
    return {
      environment: ['APP', 'WEB'],
      format: ['NATIVE_DISPLAY', 'NATIVE_VIDEO', 'NON_NATIVE_DISPLAY',
               'NON_NATIVE_VIDEO'],
      platform: ['DESKTOP', 'MOBILE', 'TABLET']
    };
  }

  /**
   * Error message to display to the end user when their data request requires
   * too many filterSets to fulfill.
   *
   * @param {number} numFilterSetsNeeded The number of filterSets that would
   * have to be created to fulfill the current request.
   * @param {number} maxNumFilterSets The maximum number of filterSets a single
   * request may generate.
   * @return {string} The error message.
   * @private
   */
  static tooManyFilterSetsError_(numFilterSetsNeeded, maxNumFilterSets) {
    return 'Your request requires the creation of ' + numFilterSetsNeeded +
        ' filterSets, but the current maximum is ' + maxNumFilterSets + '. ' +
        'You can address this error by removing the environment, format, ' +
        'and / or platform dimensions and / or by including fewer creative ' +
        'or deal IDs in your filters.';
  }
}
