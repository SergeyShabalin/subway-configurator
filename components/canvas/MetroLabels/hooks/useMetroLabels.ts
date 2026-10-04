import { useMetroStore } from '@/store'
import { useMemo } from 'react'

export const useMetroLabels = (
  visuals: Record<string, any>,
  stationNames: Record<string, string>
) => {
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const labelData = useMemo(() => {
    const result: Array<{
      id: string
      x: number
      y: number
      text: string
    }> = []

    for (const visual of Object.values(visuals)) {
      if (!visual) continue

      const stationIds = visualToStations[visual.id] || []
      const firstStationId = stationIds.length > 0 ? stationIds[0] : null
      const name = firstStationId ? stationNames[firstStationId] : ''

      if (!name) continue

      const labelOffset = visual.labelOffset || { x: 0, y: -60 }
      const labelX = labelOffset.x ?? 0
      const labelY = labelOffset.y ?? -60

      result.push({
        id: visual.id,
        x: visual.x + labelX,
        y: visual.y + labelY,
        text: name,
      })
    }

    return result
  }, [visuals, stationNames, visualToStations])

  return { labelData }
}
