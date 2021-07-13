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
 * @fileoverview Fake data for use in testing.
 */

/** Namespace for fake data. */
const fakeData = {};

/**
 * Returns a dictionary of named filterSet objects for use in testing.
 *
 * @return {!Object<string, !Object<string, *>>} Dictionary of filterSet
 *     objects.
 */
fakeData.filterSets = function() {
  const namePrefix = 'bidders/12345678/filterSets/rtb_troubleshooting_' +
      'data_studio_connector_tmp_2020-01-01';
  return {
    noFilters: {
      name: [
        namePrefix,
        'environment-ALL',
        'format-ALL',
        'platform-ALL',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    creativeIdabc123: {
      name: [
        namePrefix,
        'environment-ALL',
        'format-ALL',
        'platform-ALL',
        'creative-abc123',
        'deal-ALL',
      ].join('_'),
      creativeId: 'abc123',
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    app: {
      name: [
        namePrefix,
        'environment-APP',
        'format-ALL',
        'platform-ALL',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    web: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-ALL',
        'platform-ALL',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNativeDisplayDesktop: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NATIVE_DISPLAY',
        'platform-DESKTOP',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NATIVE_DISPLAY'],
      platforms: ['DESKTOP'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNativeDisplayMobile: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NATIVE_DISPLAY',
        'platform-MOBILE',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NATIVE_DISPLAY'],
      platforms: ['MOBILE'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNativeDisplayTablet: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NATIVE_DISPLAY',
        'platform-TABLET',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NATIVE_DISPLAY'],
      platforms: ['TABLET'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNativeVideoDesktop: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NATIVE_VIDEO',
        'platform-DESKTOP',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NATIVE_VIDEO'],
      platforms: ['DESKTOP'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNativeVideoMobile: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NATIVE_VIDEO',
        'platform-MOBILE',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NATIVE_VIDEO'],
      platforms: ['MOBILE'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNativeVideoTablet: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NATIVE_VIDEO',
        'platform-TABLET',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NATIVE_VIDEO'],
      platforms: ['TABLET'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNonNativeDisplayDesktop: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NON_NATIVE_DISPLAY',
        'platform-DESKTOP',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NON_NATIVE_DISPLAY'],
      platforms: ['DESKTOP'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNonNativeDisplayMobile: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NON_NATIVE_DISPLAY',
        'platform-MOBILE',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NON_NATIVE_DISPLAY'],
      platforms: ['MOBILE'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNonNativeDisplayTablet: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NON_NATIVE_DISPLAY',
        'platform-TABLET',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NON_NATIVE_DISPLAY'],
      platforms: ['TABLET'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNonNativeVideoDesktop: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NON_NATIVE_VIDEO',
        'platform-DESKTOP',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NON_NATIVE_VIDEO'],
      platforms: ['DESKTOP'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNonNativeVideoMobile: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NON_NATIVE_VIDEO',
        'platform-MOBILE',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NON_NATIVE_VIDEO'],
      platforms: ['MOBILE'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    appNonNativeVideoTablet: {
      name: [
        namePrefix,
        'environment-APP',
        'format-NON_NATIVE_VIDEO',
        'platform-TABLET',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'APP',
      formats: ['NON_NATIVE_VIDEO'],
      platforms: ['TABLET'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNativeDisplayDesktop: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NATIVE_DISPLAY',
        'platform-DESKTOP',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NATIVE_DISPLAY'],
      platforms: ['DESKTOP'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNativeDisplayMobile: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NATIVE_DISPLAY',
        'platform-MOBILE',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NATIVE_DISPLAY'],
      platforms: ['MOBILE'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNativeDisplayTablet: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NATIVE_DISPLAY',
        'platform-TABLET',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NATIVE_DISPLAY'],
      platforms: ['TABLET'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNativeVideoDesktop: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NATIVE_VIDEO',
        'platform-DESKTOP',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NATIVE_VIDEO'],
      platforms: ['DESKTOP'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNativeVideoMobile: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NATIVE_VIDEO',
        'platform-MOBILE',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NATIVE_VIDEO'],
      platforms: ['MOBILE'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNativeVideoTablet: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NATIVE_VIDEO',
        'platform-TABLET',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NATIVE_VIDEO'],
      platforms: ['TABLET'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNonNativeDisplayDesktop: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NON_NATIVE_DISPLAY',
        'platform-DESKTOP',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NON_NATIVE_DISPLAY'],
      platforms: ['DESKTOP'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNonNativeDisplayMobile: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NON_NATIVE_DISPLAY',
        'platform-MOBILE',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NON_NATIVE_DISPLAY'],
      platforms: ['MOBILE'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNonNativeDisplayTablet: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NON_NATIVE_DISPLAY',
        'platform-TABLET',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NON_NATIVE_DISPLAY'],
      platforms: ['TABLET'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNonNativeVideoDesktop: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NON_NATIVE_VIDEO',
        'platform-DESKTOP',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NON_NATIVE_VIDEO'],
      platforms: ['DESKTOP'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNonNativeVideoMobile: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NON_NATIVE_VIDEO',
        'platform-MOBILE',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NON_NATIVE_VIDEO'],
      platforms: ['MOBILE'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    },
    webNonNativeVideoTablet: {
      name: [
        namePrefix,
        'environment-WEB',
        'format-NON_NATIVE_VIDEO',
        'platform-TABLET',
        'creative-ALL',
        'deal-ALL',
      ].join('_'),
      environment: 'WEB',
      formats: ['NON_NATIVE_VIDEO'],
      platforms: ['TABLET'],
      timeSeriesGranularity: 'DAILY',
      relativeDateRange: {offsetDays: 1, durationDays: 30}
    }
  };
};

/**
 * Returns fake API data corresponding to specific fake filterSets.
 *
 * @return {!Object<string, !Object<string, !Array<string, *>>>} Dictionary of
 *     fake data rows keyed by names of fake filterSets.
 */
fakeData.apiRows = function() {
  return {
    [fakeData.filterSets().noFilters.name]: {
      bidMetrics: [
        {
          bids: {value: '800'},
          bidsInAuction: {value: '750'},
          impressionsWon: {value: '500'},
          reachedQueries: {value: '450'},
          billedImpressions: {value: '400'},
          measurableImpressions: {value: '400'},
          viewableImpressions: {value: '300'},
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        },
        {
          bids: {value: '1600'},
          bidsInAuction: {value: '1500'},
          impressionsWon: {value: '1000'},
          reachedQueries: {value: '900'},
          billedImpressions: {value: '800'},
          measurableImpressions: {value: '800'},
          viewableImpressions: {value: '600'},
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      bidResponseErrors: [
        {
          impressionCount: {value: '50', variance: '500'},
          calloutStatusId: 7,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        },
        {
          impressionCount: {value: '100', variance: '1000'},
          calloutStatusId: 7,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      filteredBids: [
        {
          bidCount: {value: '50'},
          creativeStatusId: 10,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        },
        {
          bidCount: {value: '100'},
          creativeStatusId: 10,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      filteredBidRequests: [
        {
          impressionCount: {value: '50', variance: '500'},
          calloutStatusId: 5,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        },
        {
          impressionCount: {value: '100', variance: '1000'},
          calloutStatusId: 5,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      impressionMetrics: [
        {
          availableImpressions: {value: '1000'},
          inventoryMatches: {value: '900', variance: '9000'},
          bidRequests: {value: '800', variance: '8000'},
          successfulResponses: {value: '750', variance: '7500'},
          responsesWithBids: {value: '400', variance: '4000'},
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        },
        {
          availableImpressions: {value: '2000'},
          inventoryMatches: {value: '1800', variance: '18000'},
          bidRequests: {value: '1600', variance: '16000'},
          successfulResponses: {value: '1500', variance: '15000'},
          responsesWithBids: {value: '800', variance: '8000'},
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      losingBids: [
        {
          bidCount: {value: '250'},
          creativeStatusId: 79,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        },
        {
          bidCount: {value: '500'},
          creativeStatusId: 79,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      nonBillableWinningBids: [
        {
          bidCount: {value: '50'},
          status: 'FATAL_VAST_ERROR',
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        },
        {
          bidCount: {value: '100'},
          status: 'FATAL_VAST_ERROR',
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ]
    },
    [fakeData.filterSets().creativeIdabc123.name]: {
      bidMetrics: [
        {
          bids: {value: '800'},
          bidsInAuction: {value: '750'},
          impressionsWon: {value: '500'},
          reachedQueries: {value: '450'},
          billedImpressions: {value: '400'},
          measurableImpressions: {value: '400'},
          viewableImpressions: {value: '300'},
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      bidResponseErrors: [
        {
          impressionCount: {value: '50', variance: '500'},
          calloutStatusId: 7,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      filteredBids: [
        {
          bidCount: {value: '50'},
          creativeStatusId: 10,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      filteredBidRequests: [
        {
          impressionCount: {value: '50', variance: '500'},
          calloutStatusId: 5,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      impressionMetrics: [
        {
          availableImpressions: {value: '1000'},
          inventoryMatches: {value: '900', variance: '9000'},
          bidRequests: {value: '800', variance: '8000'},
          successfulResponses: {value: '750', variance: '7500'},
          responsesWithBids: {value: '400', variance: '4000'},
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      losingBids: [
        {
          bidCount: {value: '250'},
          creativeStatusId: 79,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      nonBillableWinningBids: [
        {
          bidCount: {value: '50'},
          status: 'FATAL_VAST_ERROR',
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ]
    },
    [fakeData.filterSets().appNativeDisplayDesktop.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().appNativeDisplayMobile.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().appNativeDisplayTablet.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().appNativeVideoDesktop.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().appNativeVideoMobile.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().appNativeVideoTablet.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().appNonNativeDisplayDesktop.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().appNonNativeDisplayMobile.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().appNonNativeDisplayTablet.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().appNonNativeVideoDesktop.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().appNonNativeVideoMobile.name]: {
      bidMetrics: [
        {
          bids: {value: '800'},
          bidsInAuction: {value: '750'},
          impressionsWon: {value: '500'},
          reachedQueries: {value: '450'},
          billedImpressions: {value: '400'},
          measurableImpressions: {value: '400'},
          viewableImpressions: {value: '300'},
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      bidResponseErrors: [
        {
          impressionCount: {value: '50', variance: '500'},
          calloutStatusId: 7,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      filteredBids: [
        {
          bidCount: {value: '50'},
          creativeStatusId: 10,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      filteredBidRequests: [
        {
          impressionCount: {value: '50', variance: '500'},
          calloutStatusId: 5,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      impressionMetrics: [
        {
          availableImpressions: {value: '1000'},
          inventoryMatches: {value: '900', variance: '9000'},
          bidRequests: {value: '800', variance: '8000'},
          successfulResponses: {value: '750', variance: '7500'},
          responsesWithBids: {value: '400', variance: '4000'},
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      losingBids: [
        {
          bidCount: {value: '250'},
          creativeStatusId: 79,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ],
      nonBillableWinningBids: [
        {
          bidCount: {value: '50'},
          status: 'FATAL_VAST_ERROR',
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-15T07:00:00Z',
              endTime: '2020-12-16T07:00:00Z'
            }
          }
        }
      ]
    },
    [fakeData.filterSets().appNonNativeVideoTablet.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().webNativeDisplayDesktop.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().webNativeDisplayMobile.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().webNativeDisplayTablet.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().webNativeVideoDesktop.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().webNativeVideoMobile.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().webNativeVideoTablet.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().webNonNativeDisplayDesktop.name]: {
      bidMetrics: [
        {
          bids: {value: '1600'},
          bidsInAuction: {value: '1500'},
          impressionsWon: {value: '1000'},
          reachedQueries: {value: '900'},
          billedImpressions: {value: '800'},
          measurableImpressions: {value: '800'},
          viewableImpressions: {value: '600'},
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      bidResponseErrors: [
        {
          impressionCount: {value: '100', variance: '1000'},
          calloutStatusId: 7,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      filteredBids: [
        {
          bidCount: {value: '100'},
          creativeStatusId: 10,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      filteredBidRequests: [
        {
          impressionCount: {value: '100', variance: '1000'},
          calloutStatusId: 5,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      impressionMetrics: [
        {
          availableImpressions: {value: '2000'},
          inventoryMatches: {value: '1800', variance: '18000'},
          bidRequests: {value: '1600', variance: '16000'},
          successfulResponses: {value: '1500', variance: '15000'},
          responsesWithBids: {value: '800', variance: '8000'},
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      losingBids: [
        {
          bidCount: {value: '500'},
          creativeStatusId: 79,
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ],
      nonBillableWinningBids: [
        {
          bidCount: {value: '100'},
          status: 'FATAL_VAST_ERROR',
          rowDimensions: {
            timeInterval: {
              startTime: '2020-12-30T07:00:00Z',
              endTime: '2020-12-31T07:00:00Z'
            }
          }
        }
      ]
    },
    [fakeData.filterSets().webNonNativeDisplayMobile.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().webNonNativeDisplayTablet.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().webNonNativeVideoDesktop.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().webNonNativeVideoMobile.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    },
    [fakeData.filterSets().webNonNativeVideoTablet.name]: {
        bidMetrics: [],
        bidResponseErrors: [],
        filteredBids: [],
        filteredBidRequests: [],
        impressionMetrics: [],
        losingBids: [],
        nonBillableWinningBids: []
    }
  };
};
