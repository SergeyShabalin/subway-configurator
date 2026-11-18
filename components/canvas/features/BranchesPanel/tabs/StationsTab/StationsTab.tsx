'use client'

import { SortableList } from '@/components/ui/SortableList'
import { useReorderStations } from './hooks/useReorderStations'
import { useStationsOrder } from './hooks/useStationsOrder'
import { useStationsTabItems } from './hooks/useStationsTabItems'
import type { StationsTabProps } from './types'

export const StationsTab = ({ line }: StationsTabProps) => {
  const items = useStationsTabItems(line)
  const reorderStations = useReorderStations(line.id)
  const { orderedStations, handleReorder } = useStationsOrder({
    items,
    onReorder: reorderStations,
  })

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
