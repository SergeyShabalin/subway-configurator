import type { Line } from '@/types/metro'
import type { RouteLookup } from '../types'

export interface StationInfo {
  nameOf: (stationId: string) => string
  lineOf: (lineId: string | null | undefined) => Line | undefined
  lineOfStation: (stationId: string) => Line | undefined
}

/** Справочные запросы по станциям и линиям поверх готовых Map. */
export const createStationInfo = (lookup: RouteLookup): StationInfo => {
  const lineOf = (lineId: string | null | undefined) =>
    lineId ? lookup.linesById.get(lineId) : undefined

  return {
    nameOf: (stationId) => lookup.stationsById.get(stationId)?.name ?? stationId,
    lineOf,
    lineOfStation: (stationId) => lineOf(lookup.stationsById.get(stationId)?.line_id),
  }
}
