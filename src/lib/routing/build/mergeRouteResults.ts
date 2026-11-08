import type { RouteLeg, RouteResult } from '../types'
import { countTransfers } from './countTransfers'

const cloneLeg = (leg: RouteLeg): RouteLeg => ({
  ...leg,
  stationIds: [...leg.stationIds],
  stationNames: [...leg.stationNames],
})

/** Первый участок очередной части продолжает предыдущий, если линия та же и перехода нет. */
const continuesPrevious = (prev: RouteLeg | undefined, leg: RouteLeg, isPartStart: boolean) =>
  Boolean(prev) && isPartStart && prev!.lineId === leg.lineId && leg.transferMinutesBefore === 0

/** Склеивает результаты отдельных отрезков в один маршрут. */
export const mergeRouteResults = (
  fromVisualId: string,
  toVisualId: string,
  parts: ReadonlyArray<RouteResult>
): RouteResult => {
  const segmentKeys = new Set<string>()
  const visualIds = new Set<string>()
  const legs: Array<RouteLeg> = []
  let totalMinutes = 0

  parts.forEach((part, partIndex) => {
    part.segmentKeys.forEach((key) => segmentKeys.add(key))
    part.visualIds.forEach((id) => visualIds.add(id))
    totalMinutes += part.totalMinutes

    part.legs.forEach((leg, legIndex) => {
      const prev = legs[legs.length - 1]

      if (partIndex > 0 && continuesPrevious(prev, leg, legIndex === 0)) {
        prev.stationIds.push(...leg.stationIds.slice(1))
        prev.stationNames.push(...leg.stationNames.slice(1))
        prev.minutes += leg.minutes
        return
      }

      legs.push(cloneLeg(leg))
    })
  })

  const startAccess = parts[0]?.startAccess ?? null
  const endAccess = parts[parts.length - 1]?.endAccess ?? null

  return {
    fromVisualId,
    toVisualId,
    totalMinutes,
    transfersCount: countTransfers(legs, startAccess, endAccess),
    legs,
    segmentKeys,
    visualIds,
    startAccess,
    endAccess,
  }
}
