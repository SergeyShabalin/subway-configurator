import type { RouteGraph, RouteLeg, Step } from '../types'
import type { StationInfo } from './stationInfo'

export interface PendingTransfer {
  minutes: number
  from: string
}

export interface CollectedLegs {
  legs: Array<RouteLeg>
  segmentKeys: Set<string>
  visualIds: Set<string>
  /** Пересадка, после которой не было поездки (переход в конце маршрута). */
  pending: PendingTransfer | null
  /** Станция, с которой начался первый переход (для перехода в начале маршрута). */
  firstTransferFrom: string | null
}

/** Склеивает шаги пути в участки по линиям, копит ключи сегментов и посещённые визуалы. */
export const collectLegs = (
  steps: ReadonlyArray<Step>,
  graph: RouteGraph,
  info: StationInfo
): CollectedLegs => {
  const legs: Array<RouteLeg> = []
  const segmentKeys = new Set<string>()
  const visualIds = new Set<string>()

  // Накопленный переход: minutes === 0 означает «перехода нет».
  // Числа и строка вместо union с null, чтобы TypeScript не сужал тип до never.
  let pendingMinutes = 0
  let pendingFrom = ''
  let firstTransferFrom: string | null = null

  for (const { from, to, edge } of steps) {
    const fromVisual = graph.stationToVisual.get(from)
    const toVisual = graph.stationToVisual.get(to)
    if (fromVisual) visualIds.add(fromVisual)
    if (toVisual) visualIds.add(toVisual)

    if (edge.kind === 'virtual') continue

    if (edge.kind === 'transfer') {
      if (pendingMinutes === 0) pendingFrom = from
      pendingMinutes += edge.minutes
      firstTransferFrom ??= from
      continue
    }

    const lineId = edge.lineId ?? ''

    if (fromVisual && toVisual) {
      segmentKeys.add(`${lineId}-${fromVisual}-${toVisual}`)
      segmentKeys.add(`${lineId}-${toVisual}-${fromVisual}`)
    }

    const lastLeg = legs[legs.length - 1]

    if (lastLeg && lastLeg.lineId === lineId && pendingMinutes === 0) {
      lastLeg.stationIds.push(to)
      lastLeg.stationNames.push(info.nameOf(to))
      lastLeg.minutes += edge.minutes
      continue
    }

    const line = info.lineOf(lineId)
    legs.push({
      lineId,
      lineName: line?.name ?? lineId,
      lineColor: line?.color ?? '#888888',
      lineBadge: line?.lineBadge,
      lineType: line?.type,
      stationIds: [from, to],
      stationNames: [info.nameOf(from), info.nameOf(to)],
      minutes: edge.minutes,
      transferMinutesBefore: pendingMinutes,
    })
    pendingMinutes = 0
    pendingFrom = ''
  }

  const pending: PendingTransfer | null =
    pendingMinutes > 0 ? { minutes: pendingMinutes, from: pendingFrom } : null

  return { legs, segmentKeys, visualIds, pending, firstTransferFrom }
}
