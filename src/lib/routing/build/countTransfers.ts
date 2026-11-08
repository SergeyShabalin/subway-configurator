import type { RouteAccess, RouteLeg } from '../types'

/** Единое правило подсчёта пересадок: между участками плюс пешие переходы в начале и в конце. */
export const countTransfers = (
  legs: ReadonlyArray<RouteLeg>,
  startAccess: RouteAccess | null,
  endAccess: RouteAccess | null
): number => Math.max(0, legs.length - 1) + (startAccess ? 1 : 0) + (endAccess ? 1 : 0)
