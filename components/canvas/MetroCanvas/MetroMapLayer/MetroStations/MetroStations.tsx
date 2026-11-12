'use client'

import { useRoute } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { TransferDropRing } from '@/components/canvas/MetroCanvas/MetroMapLayer/MetroStations/TransferDrop/TransferDropRing'
import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { useCallback, useMemo } from 'react'
import { useMetroDrag, useMetroPosition, useMetroStations } from './hooks'
import { StationCircle } from './StationCircle'
import type { MetroStationsProps } from './types'

export const MetroStations = ({
  lineRef,
  textRef,
  onStationClick,
  transferDrop,
}: MetroStationsProps) => {
  const visuals = useMetroStore((state) => state.visuals)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const route = useRoute()
  const routeVisualIds = route?.visualIds

  const routeStationIds = useMemo(() => {
    if (!route) return null

    const ids = new Set<string>()
    for (const leg of route.legs) leg.stationIds.forEach((id) => ids.add(id))
    for (const access of [route.startAccess, route.endAccess]) {
      if (!access) continue
      ids.add(access.fromStationId)
      ids.add(access.toStationId)
    }
    return ids
  }, [route])

  const { visualData } = useMetroStations(routeStationIds)
  const { savePosition } = useMetroPosition()
  const { handleDragStart, handleDragMove, handleDragEnd } = useMetroDrag()

  const { move: moveDrop, end: endDrop } = transferDrop

  const onDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => {
      // До handleDragMove: на первом событии в сторе ещё лежит стартовая позиция
      moveDrop(visualId, e.target.x(), e.target.y())
      handleDragMove(e, visualId, lineRef, textRef)
    },
    [handleDragMove, lineRef, textRef, moveDrop]
  )

  const onDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => {
      handleDragEnd(e, visualId, (id, x, y) => {
        if (endDrop(id)) return
        savePosition(id, x, y)
      })
    },
    [handleDragEnd, savePosition, endDrop]
  )

  const visualValues = Object.values(visuals).filter((v) => v && v.id)
  const dropVisual = transferDrop.target ? visuals[transferDrop.target.visualId] : null

  return (
    <>
      {visualValues.map((visual) => {
        const data = visualData[visual.id]
        if (!data) return null

        const { isMultiLine, isTransferStation, color, colors, colorsActive } = data

        const stationIds = visualToStations[visual.id] ?? []
        const stationId = stationIds[0]
        if (!stationId) return null

        return (
          <StationCircle
            key={visual.id}
            visual={visual}
            isMultiLine={isMultiLine}
            isTransferStation={isTransferStation}
            color={color}
            colors={colors}
            colorsActive={colorsActive}
            stationId={stationId}
            isDimmed={routeVisualIds ? !routeVisualIds.has(visual.id) : false}
            onDragStart={handleDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onStationClick={onStationClick}
          />
        )
      })}

      {transferDrop.target && dropVisual && (
        <TransferDropRing x={dropVisual.x} y={dropVisual.y} armed={transferDrop.target.armed} />
      )}
    </>
  )
}
