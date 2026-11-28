import type { StationKind, StationStyle, StationStyles } from '@/types/metro'
import type { LineValueSpec } from './lineValue'

export const STATION_SIZE_SPEC: LineValueSpec = { min: 0.5, max: 3, step: 0.1, fallback: 1 }
export const STATION_STROKE_SPEC: LineValueSpec = { min: 0.5, max: 3, step: 0.1, fallback: 1 }

/** Порядок типов станций в интерфейсе и при обходе стилей. */
export const STATION_KINDS: ReadonlyArray<StationKind> = ['regular', 'transfer', 'multiLine']

export interface ResolvedStationStyle {
  sizeScale: number
  strokeScale: number
  isSquare: boolean
}

export const resolveStationStyle = (style: StationStyle | undefined): ResolvedStationStyle => ({
  sizeScale: style?.sizeScale ?? STATION_SIZE_SPEC.fallback,
  strokeScale: style?.strokeScale ?? STATION_STROKE_SPEC.fallback,
  isSquare: style?.isSquare ?? false,
})

/** Заданный стиль станций ветки для типа станции; `undefined` — значения по умолчанию. */
export const getLineStationStyle = (
  stations: StationStyles | undefined,
  lineId: string | undefined,
  kind: StationKind
): StationStyle | undefined => (lineId ? stations?.[lineId]?.[kind] : undefined)

/**
 * Стиль станции, которая может принадлежать нескольким веткам (одноимённый узел):
 * берётся первый заданный стиль среди веток узла, в порядке их следования.
 */
export const findStationStyle = (
  stations: StationStyles | undefined,
  lineIds: ReadonlyArray<string>,
  kind: StationKind
): StationStyle | undefined => {
  for (const lineId of lineIds) {
    const style = getLineStationStyle(stations, lineId, kind)
    if (style) return style
  }
  return undefined
}
