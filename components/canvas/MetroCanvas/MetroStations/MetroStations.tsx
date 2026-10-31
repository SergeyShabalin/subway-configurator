'use client'

import { useRoute } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { useCallback } from 'react'
import { StationCircle } from './StationCircle'
import { useMetroDrag, useMetroPosition, useMetroStations } from './hooks'
import type { MetroStationsProps, StationData } from './types'

export const MetroStations = ({ lineRef, textRef, onStationClick }: MetroStationsProps) => {
  const visuals = useMetroStore((state) => state.visuals)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const routeVisualIds = useRoute()?.visualIds

  const { visualData } = useMetroStations()
  const { savePosition } = useMetroPosition()
  const { handleDragStart, handleDragMove, handleDragEnd } = useMetroDrag()

  const onDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => {
      handleDragMove(e, visualId, lineRef, textRef)
    },
    [handleDragMove, lineRef, textRef]
  )

  const onDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => {
      handleDragEnd(e, visualId, (id, x, y) => savePosition(id, x, y))
    },
    [handleDragEnd, savePosition]
  )

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
            stationId={stationId}
            isDimmed={routeVisualIds ? !routeVisualIds.has(visual.id) : false}
            onDragStart={handleDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onStationClick={onStationClick}
          />
        )
      })}
    </>
  )
}
