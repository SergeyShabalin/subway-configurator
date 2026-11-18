import type { Line, Station } from '@/types/metro'
import type { StationsTabItem } from '../types'

export const buildStationsTabItems = (
  line: Line,
  stations: ReadonlyArray<Station>
): Array<StationsTabItem> => {
  const nameById = new Map(stations.map((s) => [String(s.id), s.name]))

  return (line.logicalStationIds ?? []).map((id) => ({
    id: String(id),
    name: nameById.get(String(id)) ?? String(id),
  }))
}
