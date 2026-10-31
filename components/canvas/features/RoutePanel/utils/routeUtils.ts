import { StationOption } from '@/components/canvas/features/RoutePanel/types'
import type { DropdownOption } from '@/components/ui/Dropdown'

interface BuildOptionsParams {
  stations: ReadonlyArray<{ id: string; name: string; line_id: string }>
  lines: ReadonlyArray<{ id: string; name: string; color: string }>
  visualToStations: Readonly<Record<string, ReadonlyArray<string>>>
  locale: string
}

/**
 * Формирует отсортированный список станций для выпадающих списков.
 *
 * Функция чистая: не мутирует входные данные. Внутри создаются новые массивы и объекты.
 * Возвращает новый массив, отсортированный по имени станции.
 *
 * @param params - Объект с данными стора и локалью для сортировки.
 * @returns Новый отсортированный массив опций станций (id, name, label).
 */
export const buildStationOptions = ({
  stations,
  lines,
  visualToStations,
  locale,
}: BuildOptionsParams): Array<StationOption> => {
  const stationsById = new Map(stations.map((station) => [String(station.id), station]))
  const lineNames = new Map(lines.map((line) => [String(line.id), line.name]))

  const result: Array<StationOption> = []

  for (const [visualId, stationIds] of Object.entries(visualToStations)) {
    const first = stationsById.get(String(stationIds[0]))
    if (!first) continue

    const lineLabels = [
      ...new Set(
        stationIds
          .map((id) => lineNames.get(String(stationsById.get(String(id))?.line_id)))
          .filter((name): name is string => Boolean(name))
      ),
    ]

    result.push({
      id: visualId,
      name: first.name,
      label: lineLabels.length > 0 ? `${first.name} · ${lineLabels.join(', ')}` : first.name,
    })
  }

  return [...result].sort((a, b) => a.name.localeCompare(b.name, locale))
}

/**
 * Обогащает базовые опции станций цветами линий для UI-компонента Dropdown.
 *
 * Функция чистая: не мутирует `options`, `stations`, `lines` или `visualToStations`.
 * Возвращает новый массив с новыми объектами.
 *
 * @param options - Базовый список станций, полученный из `buildStationOptions`.
 * @param stations - Массив всех логических станций (для связи с линиями).
 * @param lines - Массив всех линий (для получения цветов).
 * @param visualToStations - Карта: ID визуального узла -> массив ID логических станций.
 * @returns Новый массив опций, готовый для передачи в `Dropdown` (value, label, colors).
 */
export const buildDropdownOptions = (
  options: ReadonlyArray<StationOption>,
  stations: BuildOptionsParams['stations'],
  lines: BuildOptionsParams['lines'],
  visualToStations: BuildOptionsParams['visualToStations']
): Array<DropdownOption<string>> => {
  const stationsById = new Map(stations.map((station) => [String(station.id), station]))
  const lineColors = new Map(lines.map((line) => [String(line.id), line.color]))

  return options.map((option) => {
    const stationIds = visualToStations[option.id] ?? []

    const colors = [
      ...new Set(
        stationIds
          .map((id) => {
            const station = stationsById.get(String(id))
            return station ? lineColors.get(String(station.line_id)) : undefined
          })
          .filter((color): color is string => Boolean(color))
      ),
    ]

    return {
      value: option.id,
      label: option.label,
      colors,
    }
  })
}
