import type { LineStationItem } from '../types'

export interface LineStationsTabProps {
  stations: Array<LineStationItem>
  onReorder: (orderedStationIds: Array<string>) => Promise<void>
}
