import { useMetroStore } from '@/store'
import { useCallback, useEffect, useState } from 'react'
import { useMetroInit } from './useMetroInit'

interface UseMetroCanvasResult {
  isLoaded: boolean
  isInitializing: boolean
  reloadData: () => Promise<void>
}

export const useMetroCanvas = (): UseMetroCanvasResult => {
  const { isInitializing, initialize } = useMetroInit()
  const loadData = useMetroStore((state) => state.loadData)

  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const fetchData = async () => {
      if (isInitializing) return

      await loadData()
      setIsLoaded(true)
    }

    fetchData()
  }, [isInitializing, loadData])

  const reloadData = useCallback(async () => {
    await loadData()
  }, [loadData])

  return {
    isLoaded: isLoaded && !isInitializing,
    isInitializing,
    reloadData,
  }
}
