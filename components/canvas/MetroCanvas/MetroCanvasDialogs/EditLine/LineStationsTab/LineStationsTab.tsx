'use client'

import { SortableList } from '@/components/ui/SortableList'
import { useStationsOrder } from './hooks/useStationsOrder'
import type { LineStationsTabProps } from './types'

export const LineStationsTab = ({ stations, onReorder }: LineStationsTabProps) => {
  const { orderedStations, handleReorder } = useStationsOrder({ stations, onReorder })

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
