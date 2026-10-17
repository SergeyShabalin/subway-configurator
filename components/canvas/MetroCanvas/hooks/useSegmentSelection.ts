import { useCallback, useState } from 'react'

export interface SelectedSegment {
  lineId: string
  fromVisualId: string
  toVisualId: string
}

export interface UseSegmentSelectionResult {
  selectedSegment: SelectedSegment | null
  selectSegment: (s: SelectedSegment) => void
  clearSelection: () => void
}

export const useSegmentSelection = (): UseSegmentSelectionResult => {
  const [selectedSegment, setSelectedSegment] = useState<SelectedSegment | null>(null)

  const selectSegment = useCallback((segment: SelectedSegment) => {
    setSelectedSegment(segment)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedSegment(null)
  }, [])

  return { selectedSegment, selectSegment, clearSelection }
}
