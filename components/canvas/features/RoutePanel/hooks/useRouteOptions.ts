import { useMetroStore } from '@/store'
import { useLocale } from 'next-intl'
import { useMemo } from 'react'
import { buildDropdownOptions, buildStationOptions } from '../utils/routeUtils'

/**
 * Хук для получения списков опций станций для панели маршрутов.
 *
 * Инкапсулирует подписку на стор и мемоизацию. Возвращает два списка:
 * 1. `options` — базовые опции станций (id, name, label).
 * 2. `dropdownOptions` — опции с цветами линий, готовые для `Dropdown`.
 *
 * @returns Объект с массивами `options` и `dropdownOptions`.
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

  const dropdownOptions = useMemo(
    () => buildDropdownOptions(options, stations, lines, visualToStations),
    [options, stations, lines, visualToStations]
  )

  return { options, dropdownOptions }
}
