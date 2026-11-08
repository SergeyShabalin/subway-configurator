import type { RouteAccess } from '../types'
import type { StationInfo } from './stationInfo'

export type AccessBuilder = (
  fromStationId: string,
  toStationId: string,
  minutes: number
) => RouteAccess

/** Описание пешего перехода между станциями (в начале или в конце маршрута). */
export const createAccessBuilder =
  (info: StationInfo): AccessBuilder =>
  (fromStationId, toStationId, minutes) => {
    const fromLine = info.lineOfStation(fromStationId)
    const toLine = info.lineOfStation(toStationId)

    return {
      fromStationId,
      fromStationName: info.nameOf(fromStationId),
      fromLineId: fromLine?.id,
      fromLineColor: fromLine?.color,
      fromLineBadge: fromLine?.lineBadge,
      fromLineType: fromLine?.type,
      toStationId,
      toStationName: info.nameOf(toStationId),
      toLineId: toLine?.id,
      toLineColor: toLine?.color,
      toLineBadge: toLine?.lineBadge,
      toLineType: toLine?.type,
      minutes,
    }
  }
