import { linesRepo } from '@/src/lib/indexeddb/repositories'
import { useState } from 'react'

export const useMetroInit = () => {
  const [isInitializing, setIsInitializing] = useState(true)

  const initialize = async () => {
    try {
      const isEmpty = await linesRepo.isEmpty()

      if (isEmpty) {
        const { importMetroData } = await import('@/src/lib/indexeddb/migrations/importData')
        await importMetroData()
      }
    } catch (error) {
      console.error('[useMetroInit] Error:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  return { isInitializing, initialize }
}
