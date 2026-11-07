import type { SliceCreator } from '../types'

/**
 * Слайс маршрута: выбор точек для построения маршрута.
 *
 * Назначение:
 *   Хранение станции отправления, станции назначения, промежуточных точек
 *   и индекса выбранного альтернативного маршрута.
 *
 * Хранить здесь:
 *   - только идентификаторы станций, выбранные пользователем
 *   - индекс активной вкладки с альтернативой (0 — самый быстрый)
 *
 * Не хранить здесь:
 *   - результат расчёта маршрута: считается в `useRoutes` по данным `graphSlice`
 *   - списки вариантов для выпадающих списков: `useRouteOptions`
 *
 * Типичные правки:
 *   - Новый параметр построения (например, «избегать пересадок»): добавить поле и действие сюда,
 *     учесть в `useRoutes`, а сброс `routeAlternativeIndex` оставить в действии.
 *
 * Правило: любое изменение точек сбрасывает альтернативу на самый быстрый маршрут.
 * Зависимости: нет.
 * Частота изменений: низкая, только по действиям пользователя в панели маршрута.
 */
export interface RouteSlice {
  routeFromId: string
  routeToId: string
  routeViaIds: Array<string>
  /** Индекс выбранной вкладки альтернативы, 0 — самый быстрый маршрут. */
  routeAlternativeIndex: number
  /** Установка отправления, назначения и промежуточных точек за один вызов. */
  setRoutePoints: (fromId: string, toId: string, viaIds?: Array<string>) => void
  /** Замена станции в существующей промежуточной точке. Несуществующий индекс игнорируется. */
  setRouteVia: (index: number, stationId: string) => void
  /** Добавление пустой промежуточной точки. */
  addRouteVia: () => void
  /** Удаление промежуточной точки по индексу. */
  removeRouteVia: (index: number) => void
  setRouteAlternativeIndex: (index: number) => void
}

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
