import type { Line, Station } from '@/types/metro'
import type { LineStationItem } from '../types'

export const buildLineStationItems = (
  line: Line,
  stations: ReadonlyArray<Station>
): Array<LineStationItem> => {
  const nameById = new Map(stations.map((s) => [String(s.id), s.name]))

  return (line.logicalStationIds ?? []).map((id) => ({
    id: String(id),
    name: nameById.get(String(id)) ?? String(id),
  }))
}
