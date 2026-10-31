import { useMetroStore } from '@/store'
import { useEffect } from 'react'
import type { StationOption } from '../types'

/**
 * Хук синхронизации выбранных станций маршрута с актуальным списком.
 *
 * Если выбранную станцию удалили из схемы (или она стала недоступна),
 * хук автоматически сбрасывает соответствующий параметр (`fromId` или `toId`).
 * Это предотвращает «фантомные» маршруты, указывающие на несуществующие узлы.
 *
 * @param options - Актуальный список опций станций (из `useRouteOptions`).
 */
export const useRouteSync = (options: Array<StationOption>) => {
  const fromId = useMetroStore((state) => state.routeFromId)
  const toId = useMetroStore((state) => state.routeToId)
  const setRoutePoints = useMetroStore((state) => state.setRoutePoints)

  useEffect(() => {
    if (options.length === 0) return

    const ids = new Set(options.map((option) => option.id))
    const nextFrom = fromId && !ids.has(fromId) ? '' : fromId
    const nextTo = toId && !ids.has(toId) ? '' : toId

    if (nextFrom !== fromId || nextTo !== toId) {
      setRoutePoints(nextFrom, nextTo)
    }
  }, [options, fromId, toId, setRoutePoints])
}
