import { visualsService } from '@/src/lib/services'
import { useCallback } from 'react'

interface SavePositionResult {
  success: boolean
  error: Error | null
}

export const useMetroPosition = () => {
  const savePosition = useCallback(
    async (visualId: string, x: number, y: number): Promise<SavePositionResult> => {
      try {
        await visualsService.updatePosition(visualId, x, y)
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
