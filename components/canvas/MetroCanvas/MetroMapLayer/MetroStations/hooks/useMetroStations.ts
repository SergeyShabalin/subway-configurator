import { useMetroStore } from '@/store'
import { useMemo } from 'react'
import type { StationData } from '../types'

interface UseMetroStationsReturn {
  visualData: Record<string, StationData>
}

export const useMetroStations = (): UseMetroStationsReturn => {
  const visuals = useMetroStore((state) => state.visuals)
  const lines = useMetroStore((state) => state.lines)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const visualTransfers = useMetroStore((state) => state.visualTransfers)

  const visualData = useMemo((): Record<string, StationData> => {
    const result: Record<string, StationData> = {}
    if (!visuals) return result

    // stationId -> { lineId, color }
    const lineByStation = new Map<string, { id: string; color: string }>()
    for (const line of lines) {
      for (const stationId of line.logicalStationIds ?? []) {
        if (!lineByStation.has(stationId)) {
          lineByStation.set(stationId, { id: line.id, color: line.color })
        }
      }
    }

    // Визуалы, участвующие в пересадках
    const transferVisualIds = new Set<string>()
    for (const t of visualTransfers ?? []) {
      if (t.from_visual_id) transferVisualIds.add(t.from_visual_id)
      if (t.to_visual_id) transferVisualIds.add(t.to_visual_id)
    }

    for (const visual of Object.values(visuals)) {
      if (!visual?.id) continue

      const stationIds = visualToStations[visual.id] ?? []

      const lineIds = new Set<string>()
      const colors: Array<string> = []

      for (const stationId of stationIds) {
        const line = lineByStation.get(stationId)
        if (!line) continue
        if (!lineIds.has(line.id)) {
          lineIds.add(line.id)
          if (!colors.includes(line.color)) colors.push(line.color)
        }
      }

      const isMultiLine = lineIds.size >= 2
      const isTransferStation = !isMultiLine && transferVisualIds.has(visual.id)

      result[visual.id] = {
        isMultiLine,
        isTransferStation,
        color: isMultiLine ? undefined : (colors[0] ?? '#888888'),
        colors: isMultiLine ? colors : undefined,
      }
    }

    return result
  }, [visuals, lines, visualToStations, visualTransfers])

  return { visualData }
}
