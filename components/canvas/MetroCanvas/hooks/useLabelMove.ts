import { visualsService } from '@/src/lib/services'
import { useMetroStore, useMetroStoreApi } from '@/store'
import { useCallback } from 'react'

interface LabelStorage {
  updateLabelPosition: (visualId: string, x: number, y: number) => Promise<void>
}

/** Перенос подписи: локально сразу, затем сохранение. Сервис внедряется параметром. */
export const useLabelMove = (storage: LabelStorage = visualsService) => {
  const store = useMetroStoreApi()
  const updateVisualLabelOffset = useMetroStore((state) => state.updateVisualLabelOffset)

  return useCallback(
    async (visualId: string, x: number, y: number) => {
      const visual = store.getState().visuals[visualId]
      if (!visual) return

      const labelX = x - visual.x
      const labelY = y - visual.y

      updateVisualLabelOffset(visualId, labelX, labelY)
      await storage.updateLabelPosition(visualId, labelX, labelY)
    },
    [store, updateVisualLabelOffset, storage]
  )
}
