'use client'

import {
  buildRouteGraph,
  findRoutes,
  type RouteGraph,
  type RouteLookup,
  type RouteResult,
} from '@/src/lib/routing/findRoute'
import { useMetroStore } from '@/store'
import type { Line, Segment, Station, VisualTransfer } from '@/types/metro'
import { useMemo } from 'react'

const NO_ROUTES: Array<RouteResult> = []

interface DataRefs {
  stations: Array<Station>
  segments: Array<Segment>
  lines: Array<Line>
  visualToStations: Record<string, Array<string>>
  visualTransfers: Array<VisualTransfer>
}

interface GraphCache extends Pick<DataRefs, 'segments' | 'visualToStations' | 'visualTransfers'> {
  graph: RouteGraph
}

interface RoutesCache extends DataRefs {
  fromId: string
  toId: string
  routes: Array<RouteResult>
}

// Хук вызывают панель, линии и станции. Граф и маршруты считаются один раз на набор данных
// и пару станций, пока ссылки на массивы в сторе не изменились.
let graphCache: GraphCache | null = null
let routesCache: RoutesCache | null = null

const getGraph = ({ segments, visualToStations, visualTransfers }: DataRefs): RouteGraph => {
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

const getRoutes = (data: DataRefs, fromId: string, toId: string): Array<RouteResult> => {
  if (!fromId || !toId || fromId === toId) return NO_ROUTES

  if (
    routesCache &&
    routesCache.fromId === fromId &&
    routesCache.toId === toId &&
    routesCache.stations === data.stations &&
    routesCache.segments === data.segments &&
    routesCache.lines === data.lines &&
    routesCache.visualToStations === data.visualToStations &&
    routesCache.visualTransfers === data.visualTransfers
  ) {
    return routesCache.routes
  }

  const lookup: RouteLookup = {
    stationsById: new Map(data.stations.map((station) => [String(station.id), station])),
    linesById: new Map(data.lines.map((line) => [String(line.id), line])),
  }

  const routes = findRoutes(getGraph(data), lookup, fromId, toId)
  routesCache = { ...data, fromId, toId, routes }

  return routes
}

/** Самый быстрый маршрут и похожие варианты между выбранными точками. Считается из данных, поэтому не устаревает. */
export const useRoutes = () => {
  const fromId = useMetroStore((state) => state.routeFromId)
  const toId = useMetroStore((state) => state.routeToId)
  const stations = useMetroStore((state) => state.stations)
  const segments = useMetroStore((state) => state.segments)
  const lines = useMetroStore((state) => state.lines)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const visualTransfers = useMetroStore((state) => state.visualTransfers)
  const storedIndex = useMetroStore((state) => state.routeAlternativeIndex)
  const selectRoute = useMetroStore((state) => state.setRouteAlternativeIndex)

  const routes = useMemo(
    () => getRoutes({ stations, segments, lines, visualToStations, visualTransfers }, fromId, toId),
    [stations, segments, lines, visualToStations, visualTransfers, fromId, toId]
  )

  // Индекс может быть не задан (старый стор) или указывать на вариант, которого после правки данных уже нет
  const requestedIndex = Number.isInteger(storedIndex) ? storedIndex : 0
  const activeIndex =
    routes.length === 0 ? 0 : Math.min(Math.max(requestedIndex, 0), routes.length - 1)

  return { routes, activeIndex, route: routes[activeIndex] ?? null, selectRoute }
}

/** Выбранный маршрут: по нему подсвечивается карта. */
export const useRoute = (): RouteResult | null => useRoutes().route
