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
 * @fileoverview Specifies the connector version.
 */

/**
 * Returns a boolean indicating the connector version.
 *
 * There are two slightly different versions of this connector, one of which
 * places special constraints on Googlers. This function returns a boolean
 * indicating whether this connector imposes those constraints.
 *
 * @return {boolean} Whether this connector imposes Googler constraints.
 */
function isGooglerConnector() {
  return false;
}
