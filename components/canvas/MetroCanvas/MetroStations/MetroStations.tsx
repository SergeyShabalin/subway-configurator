'use client'

import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { StationCircle } from './StationCircle'
import { useMetroDrag, useMetroPosition, useMetroStations } from './hooks'
import type { MetroStationsProps, StationData } from './types'

export const MetroStations = ({ lineRef, textRef, onStationDoubleClick }: MetroStationsProps) => {
  const visuals = useMetroStore((state) => state.visuals)
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const { visualData } = useMetroStations()
  const { savePosition } = useMetroPosition()
  const { handleDragStart, handleDragMove, handleDragEnd } = useMetroDrag()

  const onDragMove = (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => {
    handleDragMove(e, visualId, lineRef, textRef)
  }

  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => {
    handleDragEnd(e, visualId, (id, x, y) => savePosition(id, x, y))
  }

  const visualValues = Object.values(visuals).filter((v) => v && v.id)

  return (
    <>
      {visualValues.map((visual) => {
        const data: StationData | undefined = visualData[visual.id]

        if (!data) return null

        const stationIds = visualToStations[visual.id] ?? []
        const stationId = stationIds[0]

        if (!stationId) return null

        return (
          <StationCircle
            key={visual.id}
            visual={visual}
            isTransfer={data.isTransfer}
            color={data.color}
            colors={data.colors}
            onDragStart={handleDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onDoubleClick={() => onStationDoubleClick(stationId)}
          />
        )
      })}
    </>
  )
}
