import { useCallback, useState } from 'react'

export interface UseTransferSelectionResult {
  selectedTransferId: string | null
  selectTransfer: (id: string) => void
  clearSelection: () => void
}

export const useTransferSelection = (): UseTransferSelectionResult => {
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null)

  const selectTransfer = useCallback((id: string) => {
    setSelectedTransferId(id)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedTransferId(null)
  }, [])

  return { selectedTransferId, selectTransfer, clearSelection }
}
