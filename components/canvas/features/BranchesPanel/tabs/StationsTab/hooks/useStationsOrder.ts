import { useState } from 'react'
import type { StationsTabItem } from '../types'

interface UseStationsOrderParams {
  items: Array<StationsTabItem>
  onReorder: (orderedStationIds: Array<string>) => Promise<void>
}

export const useStationsOrder = ({ items, onReorder }: UseStationsOrderParams) => {
  const [orderedStations, setOrderedStations] = useState(items)
  const [prevItems, setPrevItems] = useState(items)
  const [isSaving, setIsSaving] = useState(false)

  if (items !== prevItems) {
    setPrevItems(items)
    if (!isSaving) {
      setOrderedStations(items)
    }
  }

  const handleReorder = async (next: Array<StationsTabItem>) => {
    if (isSaving) return

    const prev = orderedStations
    setIsSaving(true)
    setOrderedStations(next)

    try {
      await onReorder(next.map((s) => s.id))
    } catch {
      setOrderedStations(prev)
    } finally {
      setIsSaving(false)
    }
  }

  return { orderedStations, handleReorder }
}
