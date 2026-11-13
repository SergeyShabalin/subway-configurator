import { useMetroStore } from '@/store'
import { useMemo } from 'react'
import type { StationAppearance } from '../types'

interface UseMetroStationsReturn {
  appearanceByVisual: Record<string, StationAppearance>
}

/**
 * @param routeStationIds станции активного маршрута. null, если маршрута нет:
 * тогда все линии считаются активными.
 */
export const useMetroStations = (
  routeStationIds: ReadonlySet<string> | null
): UseMetroStationsReturn => {
  const visuals = useMetroStore((state) => state.visuals)
  const lines = useMetroStore((state) => state.lines)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const visualTransfers = useMetroStore((state) => state.visualTransfers)

  const appearanceByVisual = useMemo((): Record<string, StationAppearance> => {
    const result: Record<string, StationAppearance> = {}
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
      const colorsActive: Array<boolean> = []

      for (const stationId of stationIds) {
        const line = lineByStation.get(stationId)
        if (!line) continue

        const isActive = routeStationIds === null || routeStationIds.has(stationId)

        if (!lineIds.has(line.id)) {
          lineIds.add(line.id)

          const colorIndex = colors.indexOf(line.color)
          if (colorIndex === -1) {
            colors.push(line.color)
            colorsActive.push(isActive)
          } else if (isActive) {
            colorsActive[colorIndex] = true
          }
        } else if (isActive) {
          // Вторая станция той же линии в узле тоже может быть на маршруте
          const colorIndex = colors.indexOf(line.color)
          if (colorIndex !== -1) colorsActive[colorIndex] = true
        }
      }

      // Маршрут не совпал ни с одной станцией узла (данные разошлись): не серим
      const hasActive = colorsActive.some(Boolean)

      const isMultiLine = lineIds.size >= 2
      const isTransferStation = !isMultiLine && transferVisualIds.has(visual.id)

      result[visual.id] = {
        isMultiLine,
        isTransferStation,
        color: isMultiLine ? undefined : (colors[0] ?? '#888888'),
        colors: isMultiLine ? colors : undefined,
        colorsActive: isMultiLine && hasActive ? colorsActive : undefined,
      }
    }

    return result
  }, [visuals, lines, visualToStations, visualTransfers, routeStationIds])

  return { appearanceByVisual }
}
