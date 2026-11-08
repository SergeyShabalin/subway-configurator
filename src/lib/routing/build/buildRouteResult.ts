import { collectLegs, PendingTransfer } from '@/src/lib/routing/build/colectLegs'
import type {
  RawPath,
  RouteAccess,
  RouteGraph,
  RouteLeg,
  RouteLookup,
  RouteResult,
  Step,
} from '../types'
import { createAccessBuilder, type AccessBuilder } from './access'
import { countTransfers } from './countTransfers'
import { createStationInfo } from './stationInfo'

const toSteps = (path: RawPath): Array<Step> =>
  path.edges.map((edge, i) => ({ from: path.nodes[i], to: path.nodes[i + 1], edge }))

/** Отбрасывает служебные (виртуальные) шаги по краям пути. */
const sliceRealSteps = (steps: ReadonlyArray<Step>): Array<Step> => {
  let first = -1
  let last = -1

  for (let i = 0; i < steps.length; i++) {
    if (steps[i].edge.kind === 'virtual') continue
    if (first === -1) first = i
    last = i
  }

  return first === -1 ? [] : steps.slice(first, last + 1)
}

const lastRealStation = (path: RawPath): string | null => {
  for (let i = path.nodes.length - 1; i >= 0; i--) {
    const node = path.nodes[i]
    if (node !== '__source__' && node !== '__target__') return node
  }
  return null
}

/**
 * Переход перед первым участком становится отдельным `startAccess`.
 * Побочный эффект: обнуляет `transferMinutesBefore` у первого участка.
 */
const extractStartAccess = (
  legs: ReadonlyArray<RouteLeg>,
  firstTransferFrom: string | null,
  buildAccess: AccessBuilder
): RouteAccess | null => {
  const firstLeg = legs[0]
  if (!firstLeg || firstLeg.transferMinutesBefore <= 0) return null

  const toStationId = firstLeg.stationIds[0]
  const access = buildAccess(
    firstTransferFrom ?? toStationId,
    toStationId,
    firstLeg.transferMinutesBefore
  )

  firstLeg.transferMinutesBefore = 0
  return access
}

const buildEndAccess = (
  path: RawPath,
  pending: PendingTransfer | null,
  buildAccess: AccessBuilder
): RouteAccess | null => {
  if (!pending || pending.minutes <= 0) return null

  const actualEnd = lastRealStation(path)
  return actualEnd ? buildAccess(pending.from, actualEnd, pending.minutes) : null
}

export const buildRouteResult = (
  graph: RouteGraph,
  lookup: RouteLookup,
  fromVisualId: string,
  toVisualId: string,
  path: RawPath
): RouteResult => {
  const realSteps = sliceRealSteps(toSteps(path))

  if (realSteps.length === 0) {
    return {
      fromVisualId,
      toVisualId,
      totalMinutes: path.minutes,
      transfersCount: 0,
      legs: [],
      segmentKeys: new Set(),
      visualIds: new Set(),
      startAccess: null,
      endAccess: null,
    }
  }

  const info = createStationInfo(lookup)
  const buildAccess = createAccessBuilder(info)

  const { legs, segmentKeys, visualIds, pending, firstTransferFrom } = collectLegs(
    realSteps,
    graph,
    info
  )

  const startAccess = extractStartAccess(legs, firstTransferFrom, buildAccess)
  const endAccess = buildEndAccess(path, pending, buildAccess)

  return {
    fromVisualId,
    toVisualId,
    totalMinutes: path.minutes,
    transfersCount: countTransfers(legs, startAccess, endAccess),
    legs,
    segmentKeys,
    visualIds,
    startAccess,
    endAccess,
  }
}
