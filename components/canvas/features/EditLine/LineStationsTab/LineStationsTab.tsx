'use client'

import { SortableList } from '@/components/ui/SortableList'
import { useState } from 'react'

export interface LineStationItem {
  id: string
  name: string
}

interface LineStationsTabProps {
  stations: Array<LineStationItem>
  onReorder: (orderedStationIds: Array<string>) => Promise<void>
}

export const LineStationsTab = ({ stations, onReorder }: LineStationsTabProps) => {
  const [items, setItems] = useState(stations)
  const [prevStations, setPrevStations] = useState(stations)
  const [isSaving, setIsSaving] = useState(false)

  if (stations !== prevStations) {
    setPrevStations(stations)
    if (!isSaving) {
      setItems(stations)
    }
  }

  const handleReorder = async (next: Array<LineStationItem>) => {
    if (isSaving) return

    const prev = items
    setIsSaving(true)
    setItems(next)

    try {
      await onReorder(next.map((s) => s.id))
    } catch {
      setItems(prev)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SortableList
      items={items}
      onReorder={handleReorder}
      renderItem={(station, index) => (
        <span>
          {index + 1}. {station.name}
        </span>
      )}
    />
  )
}
