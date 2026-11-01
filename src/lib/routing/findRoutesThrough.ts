import { mergeRouteResults } from './build/mergeRouteResults'
import { MAX_ROUTE_ALTERNATIVES } from './constants'
import { findRoutes } from './findRoutes'
import { routeSignature } from './paths/signature'
import { pickDistinctAlternatives } from './strategies/alternativesFilter'
import { buildCombinations } from './strategies/viaCombinations'
import type { RouteGraph, RouteLookup, RouteResult } from './types'

/**
 * Маршрут через промежуточные визуалы: A → P1 → P2 → … → B.
 * На каждом отрезке берём до `MAX_ROUTE_ALTERNATIVES` вариантов, перебираем комбинации
 * (с ограничением `MAX_VIA_COMBINATIONS`), склеиваем и отбираем `limit` заметно разных.
 * Если хоть один отрезок не находится — возвращаем пустой массив.
 */
export const findRoutesThrough = (
  graph: RouteGraph,
  lookup: RouteLookup,
  pointIds: ReadonlyArray<string>,
  limit: number = MAX_ROUTE_ALTERNATIVES
): Array<RouteResult> => {
  const points = pointIds.filter(Boolean)
  if (points.length < 2) return []
  if (points.some((id, i) => i > 0 && id === points[i - 1])) return []

  const perLeg: Array<Array<RouteResult>> = []
  for (let i = 0; i < points.length - 1; i++) {
    const options = findRoutes(graph, lookup, points[i], points[i + 1], MAX_ROUTE_ALTERNATIVES)
    if (options.length === 0) return []
    perLeg.push(options)
  }

  const merged = buildCombinations(perLeg)
    .map((parts) => mergeRouteResults(points[0], points[points.length - 1], parts))
    .sort((a, b) => a.totalMinutes - b.totalMinutes)

  if (merged.length === 0) return []

  const weighted = merged.map((route) => ({
    item: route,
    minutes: route.totalMinutes,
    signature: routeSignature(route),
  }))

  return pickDistinctAlternatives(weighted, limit)
}
