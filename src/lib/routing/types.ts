import type { Line, Segment, Station, VisualTransfer } from '@/types/metro'

export type EdgeKind = 'ride' | 'transfer' | 'virtual'

export interface Edge {
  to: string
  minutes: number
  kind: EdgeKind
  lineId: string | null
}

export interface Step {
  from: string
  to: string
  edge: Edge
}

export interface RawPath {
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
  /** Ключи сегментов в формате MetroLines: `${lineId}-${fromVisualId}-${toVisualId}` (в обе стороны). */
  segmentKeys: Set<string>
  /** Визуалы на маршруте, по ним подсвечиваются станции. */
  visualIds: Set<string>
}

export interface BuildGraphInput {
  segments: Array<Segment>
  visualToStations: Record<string, Array<string>>
  visualTransfers: Array<VisualTransfer>
  interchangeMinutes?: number
}

/** Служебные узлы, между которыми ищется путь. */
export const SOURCE = '__source__'
export const TARGET = '__target__'

/** Внутренний контекст одного запуска поиска. */
export interface SearchContext {
  graph: RouteGraph
  sourceEdges: Array<Edge>
  targets: ReadonlySet<string>
}

/** Стратегия выбора кратчайших путей. Позволяет подменить алгоритм (DI). */
export interface ShortestPathsFinder {
  find(ctx: SearchContext, k: number): Array<RawPath>
}
