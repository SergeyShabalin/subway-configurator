import { useState } from 'react'
import type { LineStationItem } from '../../types'
import type { LineStationsTabProps } from '../types'

export const useStationsOrder = ({ stations, onReorder }: LineStationsTabProps) => {
  const [orderedStations, setOrderedStations] = useState(stations)
  const [prevStations, setPrevStations] = useState(stations)
  const [isSaving, setIsSaving] = useState(false)

  if (stations !== prevStations) {
    setPrevStations(stations)
    if (!isSaving) {
      setOrderedStations(stations)
    }
  }

  const handleReorder = async (next: Array<LineStationItem>) => {
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
