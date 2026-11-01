import type { RawPath, RouteGraph, RouteLeg, RouteLookup, RouteResult, Step } from '../types'

export const buildRouteResult = (
  graph: RouteGraph,
  lookup: RouteLookup,
  fromVisualId: string,
  toVisualId: string,
  path: RawPath
): RouteResult => {
  const nameOf = (stationId: string) => lookup.stationsById.get(stationId)?.name ?? stationId

  const steps: Array<Step> = path.edges
    .map((edge, i) => ({ from: path.nodes[i], to: path.nodes[i + 1], edge }))
    .filter(({ edge }) => edge.kind !== 'virtual')

  const legs: Array<RouteLeg> = []
  const segmentKeys = new Set<string>()
  const visualIds = new Set<string>()

  let hasPendingTransfer = false
  let pendingTransferMinutes = 0

  for (const { from, to, edge } of steps) {
    const fromVisual = graph.stationToVisual.get(from)
    const toVisual = graph.stationToVisual.get(to)
    if (fromVisual) visualIds.add(fromVisual)
    if (toVisual) visualIds.add(toVisual)

    if (edge.kind === 'transfer') {
      hasPendingTransfer = true
      pendingTransferMinutes += edge.minutes
      continue
    }

    const lineId = edge.lineId ?? ''

    if (fromVisual && toVisual) {
      segmentKeys.add(`${lineId}-${fromVisual}-${toVisual}`)
      segmentKeys.add(`${lineId}-${toVisual}-${fromVisual}`)
    }

    const lastLeg = legs[legs.length - 1]

    if (lastLeg && lastLeg.lineId === lineId && !hasPendingTransfer) {
      lastLeg.stationIds.push(to)
      lastLeg.stationNames.push(nameOf(to))
      lastLeg.minutes += edge.minutes
    } else {
      const line = lookup.linesById.get(lineId)

      legs.push({
        lineId,
        lineName: line?.name ?? lineId,
        lineColor: line?.color ?? '#888888',
        stationIds: [from, to],
        stationNames: [nameOf(from), nameOf(to)],
        minutes: edge.minutes,
        transferMinutesBefore: pendingTransferMinutes,
      })

      hasPendingTransfer = false
      pendingTransferMinutes = 0
    }
  }

  return {
    fromVisualId,
    toVisualId,
    totalMinutes: path.minutes,
    transfersCount: Math.max(0, legs.length - 1),
    legs,
    segmentKeys,
    visualIds,
  }
}
