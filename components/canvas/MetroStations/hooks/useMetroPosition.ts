import { visualsRepo } from '@/src/lib/indexeddb/repositories'
import { useCallback } from 'react'

interface SavePositionResult {
  success: boolean
  error: Error | null
}

export const useMetroPosition = () => {
  const savePosition = useCallback(
    async (visualId: string, x: number, y: number): Promise<SavePositionResult> => {
      try {
        await visualsRepo.update(visualId, { x, y })
        return { success: true, error: null }
      } catch (error) {
        console.error('Failed to save position:', error)
        return {
          success: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        }
      }
    },
    []
  )

  return { savePosition }
}
