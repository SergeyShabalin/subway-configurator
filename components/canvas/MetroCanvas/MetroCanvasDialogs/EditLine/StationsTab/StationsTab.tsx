'use client'

import { SortableList } from '@/components/ui/SortableList'
import { useStationsOrder } from './hooks/useStationsOrder'
import { useStationsTabItems } from './hooks/useStationsTabItems'
import type { StationsTabProps } from './types'

export const StationsTab = ({ line, onReorder }: StationsTabProps) => {
  const items = useStationsTabItems(line)
  const { orderedStations, handleReorder } = useStationsOrder({ items, onReorder })

  return (
    <SortableList
      items={orderedStations}
      onReorder={handleReorder}
      renderItem={(station, index) => (
        <span>
          {index + 1}. {station.name}
        </span>
      )}
    />
  )
}
