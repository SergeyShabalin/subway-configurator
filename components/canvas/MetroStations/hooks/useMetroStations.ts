import {
  UseMetroStationsParams,
  UseMetroStationsReturn,
} from '@/components/canvas/MetroStations/hooks/types'
import { useMetroStore } from '@/store'
import { useEffect, useMemo } from 'react'
import type { StationData } from '../types'

/**
 * Builds color data for each visual station.
 *
 * For each visual, determines:
 * - Single station: color from its line
 * - Transfer station (multiple station IDs): collects all line colors
 *
 * Performance: O(n * m) where n = visuals count, m = lines count.
 * For typical metro maps (100-200 stations, 10-20 lines) this is fine.
 *
 * @param params - Object containing visuals and visualsRef
 * @returns Object containing visualData map with color information for each visual
 *
 * @example
 * const visualsRef = useRef(visuals)
 * const { visualData } = useMetroStations({ visuals, visualsRef })
 * // visualData: { "station_1": { color: "#FF0000", isTransfer: false }, ... }
 */
export const useMetroStations = ({
  visuals,
  visualsRef,
}: UseMetroStationsParams): UseMetroStationsReturn => {
  const { lines, visualToStations } = useMetroStore()

  useEffect(() => {
    visualsRef.current = visuals
  }, [visuals, visualsRef])

  const visualData = useMemo((): Record<string, StationData> => {
    const result: Record<string, StationData> = {}

    if (!visuals) {
      return result
    }

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

        if (colors.length > 0) {
          result[visual.id] = {
            color: colors[0] || '#ffffff',
            colors,
            isTransfer: true,
          }
        } else {
          result[visual.id] = { color: '#ffffff', isTransfer: true }
        }
      } else {
        const stationId = stationIds[0]
        if (!stationId) {
          result[visual.id] = { color: '#888888', isTransfer: false }
        } else {
          let foundColor = '#888888'
          for (const line of lines) {
            if (line.visualStationIds?.includes(visual.id)) {
              foundColor = line.color
              break
            }
          }
          result[visual.id] = { color: foundColor, isTransfer: false }
        }
      }
    }

    return result
  }, [visuals, lines, visualToStations])

  return { visualData }
}
