import type { SliceCreator } from '../types'

export interface RouteSlice {
  routeFromId: string
  routeToId: string
  routeViaIds: Array<string>
  routeAlternativeIndex: number
  setRoutePoints: (fromId: string, toId: string, viaIds?: Array<string>) => void
  setRouteVia: (index: number, stationId: string) => void
  addRouteVia: () => void
  removeRouteVia: (index: number) => void
  setRouteAlternativeIndex: (index: number) => void
}

// Любое изменение точек сбрасывает вкладку на самый быстрый маршрут
const RESET_ALTERNATIVE = { routeAlternativeIndex: 0 } as const

export const createRouteSlice: SliceCreator<RouteSlice> = (set) => ({
  routeFromId: '',
  routeToId: '',
  routeViaIds: [],
  routeAlternativeIndex: 0,

  setRoutePoints: (fromId, toId, viaIds = []) =>
    set({
      routeFromId: fromId,
      routeToId: toId,
      routeViaIds: viaIds,
      ...RESET_ALTERNATIVE,
    }),

  setRouteVia: (index, stationId) =>
    set((state) => ({
      routeViaIds: state.routeViaIds.map((id, i) => (i === index ? stationId : id)),
      ...RESET_ALTERNATIVE,
    })),

  addRouteVia: () =>
    set((state) => ({
      routeViaIds: [...state.routeViaIds, ''],
      ...RESET_ALTERNATIVE,
    })),

  removeRouteVia: (index) =>
    set((state) => ({
      routeViaIds: state.routeViaIds.filter((_, i) => i !== index),
      ...RESET_ALTERNATIVE,
    })),

  setRouteAlternativeIndex: (index) => set({ routeAlternativeIndex: index }),
})
