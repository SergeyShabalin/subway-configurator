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

  const visualData = useMemo((): Record<string, StationData> => {
    const result: Record<string, StationData> = {}

    if (!visuals) return result

    for (const visual of Object.values(visuals)) {
      if (!visual?.id) continue

      const stationIds = visualToStations[visual.id] || []

      if (stationIds.length > 1) {
        const colors: Array<string> = []

        for (const stationId of stationIds) {
          for (const line of lines) {
            if (line.logicalStationIds?.includes(stationId)) {
              if (!colors.includes(line.color)) {
                colors.push(line.color)
              }
              break
            }
          }
        }

        result[visual.id] = {
          color: colors[0] || '#ffffff',
          colors,
          isTransfer: true,
        }
      } else {
        const stationId = stationIds[0]

        if (!stationId) {
          result[visual.id] = { color: '#888888', isTransfer: false }
          continue
        }

        let foundColor = '#888888'
        for (const line of lines) {
          if (line.visualStationIds?.includes(visual.id)) {
            foundColor = line.color
            break
          }
        }

        result[visual.id] = {
          color: foundColor,
          isTransfer: visual.is_transfer === 1,
        }
      }
    }

    return result
  }, [visuals, lines, visualToStations])

  return { visualData }
}
