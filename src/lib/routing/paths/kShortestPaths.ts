import type { RawPath, SearchContext, ShortestPathsFinder } from '../types'
import { SOURCE } from '../types'
import { dijkstra, edgeKey } from './dijkstra'

const sharesRoot = (path: RawPath, rootNodes: ReadonlyArray<string>): boolean => {
  if (path.edges.length < rootNodes.length) return false

  for (let i = 0; i < rootNodes.length; i++) {
    if (path.nodes[i] !== rootNodes[i]) return false
  }

  return true
}

/** Алгоритм Йена: k кратчайших путей без петель, по возрастанию времени. */
export const kShortestPaths = (ctx: SearchContext, k: number): Array<RawPath> => {
  const first = dijkstra(ctx, SOURCE, new Set(), new Set())
  if (!first) return []

  const accepted: Array<RawPath> = [first]
  const candidates: Array<RawPath> = []
  const seen = new Set<string>([first.nodes.join('>')])

  while (accepted.length < k) {
    const last = accepted[accepted.length - 1]

    for (let i = 0; i < last.nodes.length - 1; i++) {
      const rootNodes = last.nodes.slice(0, i + 1)
      const rootEdges = last.edges.slice(0, i)
      const rootMinutes = rootEdges.reduce((sum, edge) => sum + edge.minutes, 0)

      const blockedEdges = new Set<string>()
      for (const path of accepted) {
        if (sharesRoot(path, rootNodes)) {
          blockedEdges.add(edgeKey(path.nodes[i], path.edges[i]))
        }
      }
      const blockedNodes = new Set(rootNodes.slice(0, -1))

      const spur = dijkstra(ctx, rootNodes[i], blockedNodes, blockedEdges)
      if (!spur) continue

      const total: RawPath = {
        nodes: [...rootNodes.slice(0, -1), ...spur.nodes],
        edges: [...rootEdges, ...spur.edges],
        minutes: rootMinutes + spur.minutes,
      }

      const key = total.nodes.join('>')
      if (seen.has(key)) continue

      seen.add(key)
      candidates.push(total)
    }

    if (candidates.length === 0) break

    let best = 0
    for (let j = 1; j < candidates.length; j++) {
      if (candidates[j].minutes < candidates[best].minutes) best = j
    }

    accepted.push(candidates.splice(best, 1)[0])
  }

  return accepted
}

/** Реализация по умолчанию — можно подменить через DI. */
export const yenFinder: ShortestPathsFinder = {
  find: (ctx, k) => kShortestPaths(ctx, k),
}
