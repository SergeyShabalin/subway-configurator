import { createLineLookup } from '@/components/canvas/shared/options/lineLookup'
import { buildLineMarkedOption } from '@/components/canvas/shared/options/lineOptionHelpers'
import { useMetroStore } from '@/store'
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
    const { getNodeLines } = createLineLookup(stations, lines)

    return base.map(({ value, label }) =>
      buildLineMarkedOption(value, label, getNodeLines(visualToStations[value] ?? [value]))
    )
  }, [options, stations, lines, visualToStations])

  return { options, dropdownOptions }
}
