import { useState } from 'react'

export interface UseStationSelectionResult {
  selectedStationId: string | null
  selectStation: (id: string) => void
  clearSelection: () => void
}

export const useStationSelection = (): UseStationSelectionResult => {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)

  const selectStation = (id: string) => setSelectedStationId(id)
  const clearSelection = () => setSelectedStationId(null)

  return { selectedStationId, selectStation, clearSelection }
}
