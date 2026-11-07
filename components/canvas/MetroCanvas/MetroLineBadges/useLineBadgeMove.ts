import { linesService } from '@/src/lib/services'
import { useMetroStore, useMetroStoreApi } from '@/store'
import type { BadgeEnd } from '@/types/metro'
import { useCallback } from 'react'

export const useLineBadgeMove = () => {
  const store = useMetroStoreApi()
  const updateLineBadgeOffset = useMetroStore((state) => state.updateLineBadgeOffset)

  return useCallback(
    async (lineId: string, end: BadgeEnd, anchorId: string, x: number, y: number) => {
      // Координаты якоря читаются в момент события, подписка на visuals не нужна
      const anchor = store.getState().visuals[anchorId]
      if (!anchor) return

      const offset = { x: x - anchor.x, y: y - anchor.y }

      updateLineBadgeOffset(lineId, end, offset) // сразу на карте
      try {
        await linesService.updateBadgeOffset(lineId, end, offset) // затем в БД
      } catch (error) {
        console.error('Failed to save badge position:', error)
      }
    },
    [store, updateLineBadgeOffset]
  )
}
