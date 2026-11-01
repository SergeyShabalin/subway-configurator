'use client'

import { useRoutes } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { useMetroStore } from '@/store'
import { useEffect, useRef } from 'react'

interface StagePoint {
  x: number
  y: number
}

/**
 * Центрирует канвас на визуалах найденного маршрута.
 *
 * - Реагирует только на смену активного маршрута (по набору `visualIds`),
 *   а не на каждое изменение стора.
 * - Не срабатывает повторно на тот же маршрут после ручного перемещения.
 * - Ничего не делает, если маршрут не найден или пуст.
 */
export const useRouteFocus = (
  centerStage: (points: Array<StagePoint>, width: number, height: number) => void,
  width: number,
  height: number
) => {
  const route = useRoutes().route
  const visuals = useMetroStore((state) => state.visuals)

  // Подпись маршрута: сортируем id, чтобы порядок в Set не влиял на сравнение
  const routeKey = route ? [...route.visualIds].sort().join('|') : ''

  const lastKeyRef = useRef('')

  useEffect(() => {
    if (!route || routeKey === '' || routeKey === lastKeyRef.current) return
    if (width === 0 || height === 0) return

    // Явно сужаем до { x, y }, чтобы совпасть с сигнатурой centerStage
    const points: Array<StagePoint> = [...route.visualIds]
      .map((id) => visuals[id])
      .filter((v): v is NonNullable<typeof v> => Boolean(v))
      .map((v) => ({ x: v.x, y: v.y }))

    if (points.length === 0) return

    centerStage(points, width, height)
    lastKeyRef.current = routeKey
  }, [route, routeKey, visuals, centerStage, width, height])
}
