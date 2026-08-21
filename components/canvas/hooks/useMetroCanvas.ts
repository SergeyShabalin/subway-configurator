import { useMetroStore } from '@/store'
import { useEffect } from 'react'
import { useMetroData } from './useMetroData'
import { useMetroInit } from './useMetroInit'
import { useMetroLoader } from './useMetroLoader'

export const useMetroCanvas = () => {
  const { isInitializing, initialize } = useMetroInit()
  const { visuals, stationNames, isLoaded, setVisuals, setStationNames, setIsLoaded } =
    useMetroData()
  const { loadData } = useMetroLoader()
  const { loadData: loadStoreData } = useMetroStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const fetchData = async () => {
      if (isInitializing) return

      await loadStoreData()
      const result = await loadData()

      if (result.visualsMap && result.namesMap) {
        setVisuals(result.visualsMap)
        setStationNames(result.namesMap)
        setIsLoaded(true)
      }
    }

    fetchData()
  }, [isInitializing, loadData, loadStoreData, setVisuals, setStationNames, setIsLoaded])

  const reloadData = async () => {
    await loadStoreData()
    const result = await loadData()
    if (result.visualsMap && result.namesMap) {
      setVisuals(result.visualsMap)
      setStationNames(result.namesMap)
    }
  }

  return {
    visuals,
    stationNames,
    isLoaded: isLoaded && !isInitializing,
    isInitializing,
    reloadData,
    setVisuals,
    setStationNames,
  }
}
