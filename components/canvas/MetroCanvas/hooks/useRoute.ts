'use client'

import {
  buildRouteGraph,
  findRoute,
  type RouteGraph,
  type RouteLookup,
  type RouteResult,
} from '@/src/lib/routing/findRoute'
import { useMetroStore } from '@/store'
import type { Segment, VisualTransfer } from '@/types/metro'
import { useMemo } from 'react'

interface GraphCache {
  segments: Array<Segment>
  visualToStations: Record<string, Array<string>>
  visualTransfers: Array<VisualTransfer>
  graph: RouteGraph
}

// Хук вызывают и панель, и линии. Граф строится один раз на набор данных,
// пока ссылки на массивы в сторе не изменились.
let graphCache: GraphCache | null = null

const getGraph = (
  segments: Array<Segment>,
  visualToStations: Record<string, Array<string>>,
  visualTransfers: Array<VisualTransfer>
): RouteGraph => {
  if (
    graphCache &&
    graphCache.segments === segments &&
    graphCache.visualToStations === visualToStations &&
    graphCache.visualTransfers === visualTransfers
  ) {
    return graphCache.graph
  }

  const graph = buildRouteGraph({ segments, visualToStations, visualTransfers })
  graphCache = { segments, visualToStations, visualTransfers, graph }

  return graph
}

/** Маршрут между выбранными точками. Считается из данных, поэтому не устаревает после правок. */
export const useRoute = (): RouteResult | null => {
  const fromId = useMetroStore((state) => state.routeFromId)
  const toId = useMetroStore((state) => state.routeToId)
  const stations = useMetroStore((state) => state.stations)
  const segments = useMetroStore((state) => state.segments)
  const lines = useMetroStore((state) => state.lines)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const visualTransfers = useMetroStore((state) => state.visualTransfers)

  return useMemo(() => {
    if (!fromId || !toId || fromId === toId) return null

    const graph = getGraph(segments, visualToStations, visualTransfers)
    const lookup: RouteLookup = {
      stationsById: new Map(stations.map((station) => [String(station.id), station])),
      linesById: new Map(lines.map((line) => [String(line.id), line])),
    }

    return findRoute(graph, lookup, fromId, toId)
  }, [fromId, toId, stations, segments, lines, visualToStations, visualTransfers])
}
