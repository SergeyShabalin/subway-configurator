'use client'

import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { useRef } from 'react'
import { StationCircle } from './StationCircle'
import { useMetroDrag, useMetroPosition, useMetroStations } from './hooks'
import type { MetroStationsProps, StationData, VisualData } from './types'

export const MetroStations = ({
  visuals,
  lineRef,
  textRef,
  setVisuals,
  onStationDoubleClick,
}: MetroStationsProps) => {
  const visualsRef = useRef<Record<string, VisualData>>({})

  const visualToStations = useMetroStore((state) => state.visualToStations)

  const { visualData } = useMetroStations({ visuals, visualsRef })
  const { savePosition } = useMetroPosition()
  const { handleDragStart, handleDragMove, handleDragEnd } = useMetroDrag(visuals, setVisuals)

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
