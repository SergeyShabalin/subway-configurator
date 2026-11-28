import type {
  LabelStyle,
  LineStationStyles,
  MapStyles,
  StationKind,
  StationStyle,
  StationStyles,
} from '@/types/metro'
import { STATION_KINDS } from './stationStyle'

/** Чистые операции над стилями: без стора, без побочных эффектов. */

/** Секции стилей вида «число на линию». Новая секция добавляется сюда и в MapStyles. */
export type LineValueKey = 'lineWidths' | 'lineCurvature'
const LINE_VALUE_KEYS: ReadonlyArray<LineValueKey> = ['lineWidths', 'lineCurvature']

export const mergeLabels = (styles: MapStyles, patch: LabelStyle): MapStyles => ({
  ...styles,
  labels: { ...styles.labels, ...patch },
})

export const clearLabels = (styles: MapStyles): MapStyles => ({ ...styles, labels: undefined })

/** Меняет стиль станций одного типа на одной ветке; остальные ветки и типы не затрагиваются. */
export const mergeStationStyle = (
  styles: MapStyles,
  lineId: string,
  kind: StationKind,
  patch: StationStyle
): MapStyles => {
  const line: LineStationStyles = { ...styles.stations?.[lineId] }
  line[kind] = { ...line[kind], ...patch }
  return { ...styles, stations: { ...styles.stations, [lineId]: line } }
}

export const clearStationLine = (styles: MapStyles, lineId: string): MapStyles => {
  const stations = { ...styles.stations }
  delete stations[lineId]
  return { ...styles, stations }
}

export const clearAllStations = (styles: MapStyles): MapStyles => ({
  ...styles,
  stations: undefined,
})

export const withLineValue = (
  styles: MapStyles,
  key: LineValueKey,
  lineId: string,
  value: number | undefined
): MapStyles => {
  const values = { ...styles[key] }
  if (value === undefined) delete values[lineId]
  else values[lineId] = value

  const next: MapStyles = { ...styles }
  next[key] = values
  return next
}

/** Сбрасывает все числовые настройки одной линии. */
export const clearLine = (styles: MapStyles, lineId: string): MapStyles =>
  LINE_VALUE_KEYS.reduce((acc, key) => withLineValue(acc, key, lineId, undefined), styles)

/** Сбрасывает числовые настройки всех линий. */
export const clearAllLines = (styles: MapStyles): MapStyles => {
  const next: MapStyles = { ...styles }
  for (const key of LINE_VALUE_KEYS) next[key] = undefined
  return next
}

/**
 * Убирает undefined-поля; пустая секция превращается в undefined.
 * Секция без undefined-полей возвращается как есть: ссылка сохраняется,
 * от неё зависит `memo` у станций.
 */
const compactSection = <T extends object>(section: T | undefined): T | undefined => {
  if (!section) return undefined
  const entries = Object.entries(section).filter(([, v]) => v !== undefined)
  if (entries.length === Object.keys(section).length) return entries.length ? section : undefined
  return entries.length ? (Object.fromEntries(entries) as T) : undefined
}

const compactStationStyles = (stations: StationStyles | undefined): StationStyles | undefined => {
  if (!stations) return undefined

  const result: StationStyles = {}
  for (const [lineId, kinds] of Object.entries(stations)) {
    const line: LineStationStyles = {}
    for (const kind of STATION_KINDS) {
      const style = compactSection(kinds[kind])
      if (style) line[kind] = style
    }
    if (Object.keys(line).length) result[lineId] = line
  }

  return Object.keys(result).length ? result : undefined
}

/** Убирает пустые секции и undefined-поля: в БД лежат только заданные значения. */
export const compactStyles = (styles: MapStyles): MapStyles => {
  const labels = compactSection(styles.labels)
  const stations = compactStationStyles(styles.stations)

  const result: MapStyles = {
    ...(labels && { labels }),
    ...(stations && { stations }),
  }

  for (const key of LINE_VALUE_KEYS) {
    const values = styles[key]
    if (values && Object.keys(values).length) result[key] = values
  }

  return result
}
