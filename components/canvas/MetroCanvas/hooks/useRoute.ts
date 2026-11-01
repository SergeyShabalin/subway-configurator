'use client'

import {
  buildRouteGraph,
  findRoutes,
  findRoutesThrough,
  type RouteGraph,
  type RouteLookup,
  type RouteResult,
} from '@/src/lib/routing'
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
  pointsKey: string
  routes: Array<RouteResult>
}

// Хук вызывают панель, линии и станции. Граф и маршруты считаются один раз на набор данных
// и набор точек, пока ссылки на массивы в сторе не изменились.
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

const getRoutes = (data: DataRefs, pointIds: ReadonlyArray<string>): Array<RouteResult> => {
  const points = pointIds.filter(Boolean)
  if (points.length < 2) return NO_ROUTES
  if (points.some((id, i) => i > 0 && id === points[i - 1])) return NO_ROUTES

  const pointsKey = points.join('>')

  if (
    routesCache &&
    routesCache.pointsKey === pointsKey &&
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

  const graph = getGraph(data)
  const routes =
    points.length === 2
      ? findRoutes(graph, lookup, points[0], points[1])
      : findRoutesThrough(graph, lookup, points)

  routesCache = { ...data, pointsKey, routes }

  return routes
}

/** Самый быстрый маршрут (с учётом промежуточных точек) и варианты между выбранными точками. */
export const useRoutes = () => {
  const fromId = useMetroStore((state) => state.routeFromId)
  const toId = useMetroStore((state) => state.routeToId)
  const viaIds = useMetroStore((state) => state.routeViaIds)
  const stations = useMetroStore((state) => state.stations)
  const segments = useMetroStore((state) => state.segments)
  const lines = useMetroStore((state) => state.lines)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const visualTransfers = useMetroStore((state) => state.visualTransfers)
  const storedIndex = useMetroStore((state) => state.routeAlternativeIndex)
  const selectRoute = useMetroStore((state) => state.setRouteAlternativeIndex)

  const pointIds = useMemo(() => [fromId, ...viaIds, toId], [fromId, viaIds, toId])

  const routes = useMemo(
    () => getRoutes({ stations, segments, lines, visualToStations, visualTransfers }, pointIds),
    [stations, segments, lines, visualToStations, visualTransfers, pointIds]
  )

  // Индекс может быть не задан (старый стор) или указывать на вариант, которого после правки данных уже нет
  const requestedIndex = Number.isInteger(storedIndex) ? storedIndex : 0
  const activeIndex =
    routes.length === 0 ? 0 : Math.min(Math.max(requestedIndex, 0), routes.length - 1)

  return { routes, activeIndex, route: routes[activeIndex] ?? null, selectRoute }
}

/** Выбранный маршрут: по нему подсвечивается карта. */
export const useRoute = (): RouteResult | null => useRoutes().route
