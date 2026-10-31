import type { Line, Segment, Station, VisualTransfer } from '@/types/metro'

// Время пересадки внутри одного узла (станции на одном визуале). В данных его нет.
export const DEFAULT_INTERCHANGE_MINUTES = 3

interface Edge {
  to: string
  minutes: number
  kind: 'ride' | 'transfer'
  lineId: string | null
}

interface Step {
  from: string
  to: string
  edge: Edge
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
  segmentKeys: Set<string>
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

const shortestPath = (
  graph: RouteGraph,
  fromVisualId: string,
  toVisualId: string
): { steps: Array<Step>; minutes: number } | null => {
  const sources = graph.visualToStations[fromVisualId] ?? []
  const targets = new Set(graph.visualToStations[toVisualId] ?? [])

  if (sources.length === 0 || targets.size === 0 || fromVisualId === toVisualId) return null

  const dist = new Map<string, number>()
  const prev = new Map<string, { from: string; edge: Edge }>()
  const heap = new MinHeap()

  // Все станции стартового узла стартуют с нуля: пересадка на старте не считается
  for (const source of sources) {
    dist.set(source, 0)
    heap.push(source, 0)
  }

  while (heap.size > 0) {
    const current = heap.pop()
    if (!current) break

    const { node, key } = current
    if (key > (dist.get(node) ?? Infinity)) continue // устаревшая запись в куче

    if (targets.has(node)) {
      const steps: Array<Step> = []
      let cursor = node

      for (let entry = prev.get(cursor); entry; entry = prev.get(cursor)) {
        steps.push({ from: entry.from, to: cursor, edge: entry.edge })
        cursor = entry.from
      }

      return { steps: steps.reverse(), minutes: key }
    }

    for (const edge of graph.adjacency.get(node) ?? []) {
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

export const findRoute = (
  graph: RouteGraph,
  lookup: RouteLookup,
  fromVisualId: string,
  toVisualId: string
): RouteResult | null => {
  const path = shortestPath(graph, fromVisualId, toVisualId)
  if (!path) return null

  const nameOf = (stationId: string) => lookup.stationsById.get(stationId)?.name ?? stationId

  const legs: Array<RouteLeg> = []
  const segmentKeys = new Set<string>()
  const visualIds = new Set<string>()

  let hasPendingTransfer = false
  let pendingTransferMinutes = 0

  for (const { from, to, edge } of path.steps) {
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
