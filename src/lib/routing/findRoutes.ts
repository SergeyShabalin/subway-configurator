import { buildRouteResult } from './build/buildRouteResult'
import { CANDIDATE_POOL_SIZE, MAX_ROUTE_ALTERNATIVES } from './constants'
import { kShortestPaths, yenFinder } from './paths/kShortestPaths'
import { rideSignature } from './paths/signature'
import { pickDistinctAlternatives } from './strategies/alternativesFilter'
import type {
  RouteGraph,
  RouteLookup,
  RouteResult,
  SearchContext,
  ShortestPathsFinder,
} from './types'

/**
 * Самый быстрый маршрут и до `limit - 1` заметно отличающихся, по возрастанию времени.
 * По умолчанию используется алгоритм Йена, но через `finder` можно подставить другой.
 */
export const findRoutes = (
  graph: RouteGraph,
  lookup: RouteLookup,
  fromVisualId: string,
  toVisualId: string,
  limit: number = MAX_ROUTE_ALTERNATIVES,
  finder: ShortestPathsFinder = yenFinder
): Array<RouteResult> => {
  const sources = graph.visualToStations[fromVisualId] ?? []
  const targets = new Set(graph.visualToStations[toVisualId] ?? [])

  if (sources.length === 0 || targets.size === 0 || fromVisualId === toVisualId) return []

  const ctx: SearchContext = {
    graph,
    targets,
    sourceEdges: sources.map((to) => ({ to, minutes: 0, kind: 'virtual', lineId: null })),
  }
  const paths = finder.find(ctx, limit <= 1 ? 1 : CANDIDATE_POOL_SIZE)
  if (paths.length === 0) return []

  const weighted = paths.map((path) => ({
    item: path,
    minutes: path.minutes,
    signature: rideSignature(path),
  }))

  return pickDistinctAlternatives(weighted, limit).map((path) =>
    buildRouteResult(graph, lookup, fromVisualId, toVisualId, path)
  )
}

export { kShortestPaths }
