import { lineMarker } from '@/components/canvas/shared/options/optionMarkers'
import { useMetroStore } from '@/store'
import type { Line } from '@/types/metro'
import { useLocale } from 'next-intl'
import { useMemo } from 'react'
import { buildDropdownOptions, buildStationOptions } from '../utils/routeUtils'

/**
 * Хук для получения списков опций станций для панели маршрутов.
 *
 * 1. `options` — базовые опции станций (id, name, label).
 * 2. `dropdownOptions` — опции для `Dropdown`. `value` — id визуала,
 *    `leading` — значки всех линий узла.
 */
export const useRouteOptions = () => {
  const locale = useLocale()

  const stations = useMetroStore((state) => state.stations)
  const lines = useMetroStore((state) => state.lines)
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const options = useMemo(
    () => buildStationOptions({ stations, lines, visualToStations, locale }),
    [stations, lines, visualToStations, locale]
  )

  const dropdownOptions = useMemo(() => {
    const base = buildDropdownOptions(options, stations, lines, visualToStations)

    const stationById = new Map(stations.map((station) => [station.id, station]))
    const lineById = new Map(lines.map((line) => [line.id, line]))

    return base.map(({ value, label }) => {
      const nodeLines = new Map<string, Line>()
      for (const stationId of visualToStations[value] ?? [value]) {
        const station = stationById.get(stationId)
        const line = station ? lineById.get(station.line_id) : undefined
        if (line) nodeLines.set(line.id, line)
      }

      return { value, label, leading: lineMarker([...nodeLines.values()]) }
    })
  }, [options, stations, lines, visualToStations])

  return { options, dropdownOptions }
}
