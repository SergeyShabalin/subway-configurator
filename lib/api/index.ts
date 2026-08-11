export { BaseApiClient, EApiClientName } from './base-client'
export { GraphClient } from './clients/graph-client/graph-client'
export { LinesClient } from './clients/lines-client/lines-client'
export { StationsClient } from './clients/stations-client/stations-client'
export type {
  CreateLineData,
  CreateStationData,
  GraphData,
  Line,
  Segment,
  Station,
  Visual,
} from './types'

import { GraphClient } from './clients/graph-client/graph-client'
import { LinesClient } from './clients/lines-client/lines-client'
import { StationsClient } from './clients/stations-client/stations-client'

export const graphClient = new GraphClient()
export const linesClient = new LinesClient()
export const stationsClient = new StationsClient()
