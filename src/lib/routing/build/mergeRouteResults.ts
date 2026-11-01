import type { RouteLeg, RouteResult } from '../types'

/** Склеивает результаты отдельных отрезков в один маршрут. */
export const mergeRouteResults = (
  fromVisualId: string,
  toVisualId: string,
  parts: ReadonlyArray<RouteResult>
): RouteResult => {
  const segmentKeys = new Set<string>()
  const visualIds = new Set<string>()
  const mergedLegs: Array<RouteLeg> = []
  let totalMinutes = 0

  parts.forEach((part, partIndex) => {
    part.segmentKeys.forEach((key) => segmentKeys.add(key))
    part.visualIds.forEach((id) => visualIds.add(id))
    totalMinutes += part.totalMinutes

    part.legs.forEach((leg, legIndex) => {
      const prev = mergedLegs[mergedLegs.length - 1]
      const isFirstLegOfPart = legIndex === 0

      if (
        prev &&
        isFirstLegOfPart &&
        partIndex > 0 &&
        prev.lineId === leg.lineId &&
        leg.transferMinutesBefore === 0
      ) {
        prev.stationIds.push(...leg.stationIds.slice(1))
        prev.stationNames.push(...leg.stationNames.slice(1))
        prev.minutes += leg.minutes
        return
      }

      mergedLegs.push({
        ...leg,
        stationIds: [...leg.stationIds],
        stationNames: [...leg.stationNames],
      })
    })
  })

  return {
    fromVisualId,
    toVisualId,
    totalMinutes,
    transfersCount: Math.max(0, mergedLegs.length - 1),
    legs: mergedLegs,
    segmentKeys,
    visualIds,
  }
}
