import type { Line, Segment, Station, VisualTransfer } from '@/types/metro'

// Время пересадки внутри одного узла (станции на одном визуале). В данных его нет.
export const DEFAULT_INTERCHANGE_MINUTES = 3

// Сколько вариантов показываем, включая самый быстрый
export const MAX_ROUTE_ALTERNATIVES = 3
// Сколько кратчайших путей перебираем, чтобы выбрать из них заметно разные
const CANDIDATE_POOL_SIZE = 24
// Вариант годится, если он медленнее лучшего не больше чем на max(MIN_EXTRA_MINUTES, лучший * EXTRA_TIME_RATIO)
const MIN_EXTRA_MINUTES = 5
const EXTRA_TIME_RATIO = 0.3
// Если общих перегонов больше этой доли от меньшего маршрута, это один и тот же маршрут
const MAX_SHARED_RATIO = 0.75

const SOURCE = '__source__'
const TARGET = '__target__'

type EdgeKind = 'ride' | 'transfer' | 'virtual'

interface Edge {
  to: string
  minutes: number
  kind: EdgeKind
  lineId: string | null
}

interface Step {
  from: string
  to: string
  edge: Edge
}

interface RawPath {
  nodes: Array<string>
  edges: Array<Edge>
  minutes: number
}

export interface RouteGraph {
  adjacency: Map<string, Array<Edge>>
  stationToVisual: Map<string, string>
  visualToStations: Record<string, Array<string>>
}

export interface RouteLookup {
  stationsById: Map<string, Station>
  linesById: Map<string, Line>
}

export interface RouteLeg {
  lineId: string
  lineName: string
  lineColor: string
  stationIds: Array<string>
  stationNames: Array<string>
  minutes: number
  transferMinutesBefore: number
}

export interface RouteResult {
  fromVisualId: string
  toVisualId: string
  totalMinutes: number
  transfersCount: number
  legs: Array<RouteLeg>
  /** Ключи сегментов в формате MetroLines: `${lineId}-${fromVisualId}-${toVisualId}` (в обе стороны) */
  segmentKeys: Set<string>
  /** Визуалы на маршруте, по ним подсвечиваются станции */
  visualIds: Set<string>
}

interface BuildGraphInput {
  segments: Array<Segment>
  visualToStations: Record<string, Array<string>>
  visualTransfers: Array<VisualTransfer>
  interchangeMinutes?: number
}

const toMinutes = (value: number): number => (Number.isFinite(value) && value > 0 ? value : 0)

export const buildRouteGraph = ({
  segments,
  visualToStations,
  visualTransfers,
  interchangeMinutes = DEFAULT_INTERCHANGE_MINUTES,
}: BuildGraphInput): RouteGraph => {
  const adjacency = new Map<string, Array<Edge>>()
  const stationToVisual = new Map<string, string>()

  const connect = (
    a: string,
    b: string,
    minutes: number,
    kind: Edge['kind'],
    lineId: string | null
  ) => {
    const fromA = adjacency.get(a) ?? []
    fromA.push({ to: b, minutes, kind, lineId })
    adjacency.set(a, fromA)

    const fromB = adjacency.get(b) ?? []
    fromB.push({ to: a, minutes, kind, lineId })
    adjacency.set(b, fromB)
  }

  for (const [visualId, stationIds] of Object.entries(visualToStations)) {
    for (const id of stationIds) stationToVisual.set(id, visualId)

    // Пересадка между станциями одного узла
    for (let i = 0; i < stationIds.length; i++) {
      for (let j = i + 1; j < stationIds.length; j++) {
        connect(stationIds[i], stationIds[j], interchangeMinutes, 'transfer', null)
      }
    }
  }

  for (const segment of segments) {
    connect(
      segment.from_station_id,
      segment.to_station_id,
      toMinutes(segment.time_minutes),
      'ride',
      String(segment.line_id)
    )
  }

  // Переход между узлами: с любой станции одного на любую станцию другого
  for (const transfer of visualTransfers) {
    const fromStations = visualToStations[transfer.from_visual_id] ?? []
    const toStations = visualToStations[transfer.to_visual_id] ?? []

    for (const a of fromStations) {
      for (const b of toStations) {
        connect(a, b, toMinutes(transfer.time_minutes), 'transfer', null)
      }
    }
  }

  return { adjacency, stationToVisual, visualToStations }
}

class MinHeap {
  private nodes: Array<string> = []
  private keys: Array<number> = []

  get size(): number {
    return this.nodes.length
  }

  push(node: string, key: number): void {
    let i = this.nodes.length
    this.nodes.push(node)
    this.keys.push(key)

    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.keys[parent] <= key) break
      this.nodes[i] = this.nodes[parent]
      this.keys[i] = this.keys[parent]
      i = parent
    }

    this.nodes[i] = node
    this.keys[i] = key
  }

  pop(): { node: string; key: number } | undefined {
    const size = this.nodes.length
    if (size === 0) return undefined

    const top = { node: this.nodes[0], key: this.keys[0] }
    const lastNode = this.nodes.pop() as string
    const lastKey = this.keys.pop() as number
    const n = size - 1

    if (n > 0) {
      let i = 0

      while (true) {
        let child = 2 * i + 1
        if (child >= n) break
        if (child + 1 < n && this.keys[child + 1] < this.keys[child]) child++
        if (this.keys[child] >= lastKey) break

        this.nodes[i] = this.nodes[child]
        this.keys[i] = this.keys[child]
        i = child
      }

      this.nodes[i] = lastNode
      this.keys[i] = lastKey
    }

    return top
  }
}

/**
 * Поиск идёт по графу с двумя служебными узлами: SOURCE соединён со всеми станциями узла отправления,
 * а все станции узла назначения соединены с TARGET (рёбра нулевой длины). Так у пары узлов с несколькими
 * станциями каждый путь ищется одним запуском, а пересадка на старте и на финише не считается.
 */
interface SearchContext {
  graph: RouteGraph
  sourceEdges: Array<Edge>
  targets: ReadonlySet<string>
}

const TARGET_EDGE: Edge = { to: TARGET, minutes: 0, kind: 'virtual', lineId: null }
const NO_EDGES: Array<Edge> = []

const edgesOf = (ctx: SearchContext, node: string): ReadonlyArray<Edge> => {
  if (node === SOURCE) return ctx.sourceEdges

  const edges = ctx.graph.adjacency.get(node) ?? NO_EDGES
  return ctx.targets.has(node) ? [...edges, TARGET_EDGE] : edges
}

const edgeKey = (from: string, edge: Edge): string =>
  `${from}>${edge.to}>${edge.kind}>${edge.lineId ?? ''}`

const dijkstra = (
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
    if (key > (dist.get(node) ?? Infinity)) continue // устаревшая запись в куче

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

const sharesRoot = (path: RawPath, rootNodes: ReadonlyArray<string>): boolean => {
  if (path.edges.length < rootNodes.length) return false

  for (let i = 0; i < rootNodes.length; i++) {
    if (path.nodes[i] !== rootNodes[i]) return false
  }

  return true
}

/** Алгоритм Йена: k кратчайших путей без петель, по возрастанию времени. */
const kShortestPaths = (ctx: SearchContext, k: number): Array<RawPath> => {
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

      // Запрещаем рёбра, которыми уже идут принятые пути с тем же началом, и узлы самого начала
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

/** Набор перегонов маршрута без направления: по нему сравниваем, насколько варианты похожи. */
const rideSignature = (path: RawPath): Set<string> => {
  const signature = new Set<string>()

  path.edges.forEach((edge, i) => {
    if (edge.kind !== 'ride') return

    const [a, b] = [path.nodes[i], path.nodes[i + 1]].sort()
    signature.add(`${edge.lineId}:${a}:${b}`)
  })

  return signature
}

const sharedRatio = (a: Set<string>, b: Set<string>): number => {
  const smallest = Math.min(a.size, b.size)
  if (smallest === 0) return a.size === b.size ? 1 : 0

  let shared = 0
  for (const key of a) {
    if (b.has(key)) shared++
  }

  return shared / smallest
}

const buildRouteResult = (
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

/** Самый быстрый маршрут и до `limit - 1` заметно отличающихся от него, по возрастанию времени. */
export const findRoutes = (
  graph: RouteGraph,
  lookup: RouteLookup,
  fromVisualId: string,
  toVisualId: string,
  limit: number = MAX_ROUTE_ALTERNATIVES
): Array<RouteResult> => {
  const sources = graph.visualToStations[fromVisualId] ?? []
  const targets = new Set(graph.visualToStations[toVisualId] ?? [])

  if (sources.length === 0 || targets.size === 0 || fromVisualId === toVisualId) return []

  const ctx: SearchContext = {
    graph,
    targets,
    sourceEdges: sources.map((to) => ({ to, minutes: 0, kind: 'virtual', lineId: null })),
  }

  const paths = kShortestPaths(ctx, limit <= 1 ? 1 : CANDIDATE_POOL_SIZE)
  if (paths.length === 0) return []

  const best = paths[0]
  const maxMinutes = best.minutes + Math.max(MIN_EXTRA_MINUTES, best.minutes * EXTRA_TIME_RATIO)

  const selected: Array<{ path: RawPath; signature: Set<string> }> = [
    { path: best, signature: rideSignature(best) },
  ]

  for (const path of paths.slice(1)) {
    if (selected.length >= limit || path.minutes > maxMinutes) break

    const signature = rideSignature(path)
    const isDistinct = selected.every(
      (item) => sharedRatio(signature, item.signature) <= MAX_SHARED_RATIO
    )

    if (isDistinct) selected.push({ path, signature })
  }

  return selected.map(({ path }) => buildRouteResult(graph, lookup, fromVisualId, toVisualId, path))
}

export const findRoute = (
  graph: RouteGraph,
  lookup: RouteLookup,
  fromVisualId: string,
  toVisualId: string
): RouteResult | null => findRoutes(graph, lookup, fromVisualId, toVisualId, 1)[0] ?? null
