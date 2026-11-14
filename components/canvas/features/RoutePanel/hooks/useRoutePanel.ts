import { useRoutes } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { useMetroStore } from '@/store'
import { resolveRouteStatus } from '../helpers/resolveRouteStatus'
import { useRouteOptions } from './useRouteOptions'
import { useRouteSync } from './useRouteSync'

export const useRoutePanel = () => {
  const fromId = useMetroStore((state) => state.routeFromId)
  const toId = useMetroStore((state) => state.routeToId)
  const viaIds = useMetroStore((state) => state.routeViaIds)
  const setRoutePoints = useMetroStore((state) => state.setRoutePoints)
  const setRouteVia = useMetroStore((state) => state.setRouteVia)
  const addRouteVia = useMetroStore((state) => state.addRouteVia)
  const removeRouteVia = useMetroStore((state) => state.removeRouteVia)

  const { routes, activeIndex, route, selectRoute } = useRoutes()
  const { options, dropdownOptions } = useRouteOptions()
  useRouteSync(options)

  return {
    hasStations: options.length > 0,
    dropdownOptions,
    points: { fromId, toId, viaIds },
    hasPoints: Boolean(fromId || toId || viaIds.length > 0),
    result: {
      routes,
      activeIndex,
      selectRoute,
      status: resolveRouteStatus({ fromId, toId, viaIds, hasRoute: Boolean(route) }),
    },
    actions: {
      setFrom: (value: string) => setRoutePoints(value, toId, viaIds),
      setTo: (value: string) => setRoutePoints(fromId, value, viaIds),
      setVia: setRouteVia,
      addVia: addRouteVia,
      removeVia: removeRouteVia,
      swap: () => setRoutePoints(toId, fromId, [...viaIds].reverse()),
      reset: () => setRoutePoints('', '', []),
    },
  }
}
