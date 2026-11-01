import { MinHeap } from '../graph/minHeap'
import type { Edge, RawPath, SearchContext } from '../types'
import { SOURCE, TARGET } from '../types'

const TARGET_EDGE: Edge = { to: TARGET, minutes: 0, kind: 'virtual', lineId: null }
const NO_EDGES: Array<Edge> = []

const edgesOf = (ctx: SearchContext, node: string): ReadonlyArray<Edge> => {
  if (node === SOURCE) return ctx.sourceEdges

  const edges = ctx.graph.adjacency.get(node) ?? NO_EDGES
  return ctx.targets.has(node) ? [...edges, TARGET_EDGE] : edges
}

export const edgeKey = (from: string, edge: Edge): string =>
  `${from}>${edge.to}>${edge.kind}>${edge.lineId ?? ''}`

export const dijkstra = (
  ctx: SearchContext,
  start: string,
  blockedNodes: ReadonlySet<string>,
  blockedEdges: ReadonlySet<string>
): RawPath | null => {
  const dist = new Map<string, number>([[start, 0]])
  const prev = new Map<string, { from: string; edge: Edge }>()
  const heap = new MinHeap()
  heap.push(start, 0)

  while (heap.size > 0) {
    const current = heap.pop()
    if (!current) break

    const { node, key } = current
    if (key > (dist.get(node) ?? Infinity)) continue

    if (node === TARGET) {
      const nodes: Array<string> = [TARGET]
      const edges: Array<Edge> = []
      let cursor = TARGET

      for (let entry = prev.get(cursor); entry; entry = prev.get(cursor)) {
        nodes.push(entry.from)
        edges.push(entry.edge)
        cursor = entry.from
      }

      return { nodes: nodes.reverse(), edges: edges.reverse(), minutes: key }
    }

    for (const edge of edgesOf(ctx, node)) {
      if (blockedNodes.has(edge.to) || blockedEdges.has(edgeKey(node, edge))) continue

      const candidate = key + edge.minutes

      if (candidate < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, candidate)
        prev.set(edge.to, { from: node, edge })
        heap.push(edge.to, candidate)
      }
    }
  }

  return null
}
