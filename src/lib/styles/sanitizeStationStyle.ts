import type { LineStationStyles, StationStyle, StationStyles } from '@/types/metro'
import { clampLineValue } from './lineValue'
import { STATION_KINDS, STATION_SIZE_SPEC, STATION_STROKE_SPEC } from './stationStyle'

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const sanitizeStationStyle = (raw: unknown): StationStyle | undefined => {
  if (!isObject(raw)) return undefined

  const style: StationStyle = {}

  if (isFiniteNumber(raw.sizeScale)) {
    style.sizeScale = clampLineValue(STATION_SIZE_SPEC, raw.sizeScale)
  }
  if (isFiniteNumber(raw.strokeScale)) {
    style.strokeScale = clampLineValue(STATION_STROKE_SPEC, raw.strokeScale)
  }
  if (typeof raw.isSquare === 'boolean') style.isSquare = raw.isSquare

  return Object.keys(style).length ? style : undefined
}

export const sanitizeStationStyles = (raw: unknown): StationStyles | undefined => {
  if (!isObject(raw)) return undefined

  const result: StationStyles = {}
  for (const [lineId, kinds] of Object.entries(raw)) {
    if (!isObject(kinds)) continue

    const line: LineStationStyles = {}
    for (const kind of STATION_KINDS) {
      const style = sanitizeStationStyle(kinds[kind])
      if (style) line[kind] = style
    }
    if (Object.keys(line).length) result[lineId] = line
  }

  return Object.keys(result).length ? result : undefined
}
