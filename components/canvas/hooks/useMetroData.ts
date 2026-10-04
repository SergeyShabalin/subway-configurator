import type { VisualStation } from '@/store'
import { useState } from 'react'

export const useMetroData = () => {
  const [visuals, setVisuals] = useState<Record<string, VisualStation>>({})
  const [stationNames, setStationNames] = useState<Record<string, string>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  return {
    visuals,
    stationNames,
    isLoaded,
    setVisuals,
    setStationNames,
    setIsLoaded,
  }
}
