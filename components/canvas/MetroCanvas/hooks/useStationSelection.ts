import { useCallback, useState } from 'react'

export const useStationSelection = () => {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)

  const selectStation = useCallback((stationId: string) => {
    setSelectedStationId(stationId)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedStationId(null)
  }, [])

  return {
    selectedStationId,
    selectStation,
    clearSelection,
  }
}
