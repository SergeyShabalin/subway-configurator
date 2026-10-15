import { useMetroStore } from '@/store'
import type { VisualStation } from '@/types/metro'
import { useMemo } from 'react'

export interface LabelData {
  id: string
  x: number
  y: number
  text: string
}

interface UseMetroLabelsReturn {
  labelData: Array<LabelData>
}

export const useMetroLabels = (
  visuals: Record<string, VisualStation>,
  stationNames: Record<string, string>
): UseMetroLabelsReturn => {
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const labelData = useMemo<Array<LabelData>>(() => {
    const result: Array<LabelData> = []

    for (const visual of Object.values(visuals)) {
      if (!visual) continue

      const stationIds = visualToStations[visual.id] ?? []
      const firstStationId = stationIds.length > 0 ? stationIds[0] : null
      const name = firstStationId ? stationNames[firstStationId] : ''

      if (!name) continue

      const labelOffset = visual.labelOffset ?? { x: 0, y: -60 }

      result.push({
        id: visual.id,
        x: visual.x + (labelOffset.x ?? 0),
        y: visual.y + (labelOffset.y ?? -60),
        text: name,
      })
    }

    return result
  }, [visuals, stationNames, visualToStations])

  return { labelData }
}
