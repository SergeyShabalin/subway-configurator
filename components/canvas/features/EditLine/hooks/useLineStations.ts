import { useMetroStore } from '@/store'
import { useMemo } from 'react'
import type { LineStationItem } from '../LineStationsTab/LineStationsTab'

export const useLineStations = (lineId: string | undefined): Array<LineStationItem> => {
  const lines = useMetroStore((state) => state.lines)
  const stations = useMetroStore((state) => state.stations)

  return useMemo(() => {
    if (!lineId) return []

    const line = lines.find((l) => String(l.id) === String(lineId))
    if (!line) return []

    const nameById = new Map(stations.map((s) => [String(s.id), s.name]))

    return (line.logicalStationIds ?? []).map((id) => ({
      id: String(id),
      name: nameById.get(String(id)) ?? String(id),
    }))
  }, [lineId, lines, stations])
}
