// components/canvas/MetroStations/MetroStations.tsx
'use client'

import { useVisualsRef } from '@/components/canvas/hooks/useVisualsRef'
import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { useCallback } from 'react'
import { Circle } from 'react-konva'
import { MetroStationsProps } from './types'

export const MetroStations = ({
  visuals,
  circleRef,
  lineRef,
  textRef,
  setVisuals,
}: MetroStationsProps) => {
  const { lines, visualToStations, setDragging, saveVisualPosition } = useMetroStore()
  const visualsRef = useVisualsRef(visuals)

  const getStationColor = useCallback(
    (visualId: string): string => {
      const stationIds = visualToStations[visualId] || []

      if (stationIds.length > 1) {
        return '#b1aaaa'
      }

      const stationId = stationIds[0]
      if (!stationId) return '#888888'

      for (const line of lines) {
        if (line.logicalStationIds?.includes(stationId)) {
          return line.color
        }
      }

      return '#888888'
    },
    [lines, visualToStations]
  )

  const handleDragStart = useCallback(() => {
    setDragging(true)
  }, [setDragging])

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => {
      const newX = e.target.x()
      const newY = e.target.y()

      if (visualsRef.current[visualId]) {
        visualsRef.current[visualId] = {
          ...visualsRef.current[visualId],
          x: newX,
          y: newY,
        }
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNode = lineRef.current[line.id]
        if (!lineNode) continue

        const points = lineNode.points() as Array<number>
        const visualIndex = line.visualStationIds.findIndex((id) => id === visualId)

        if (visualIndex !== -1) {
          points[visualIndex * 2] = newX
          points[visualIndex * 2 + 1] = newY
          lineNode.points(points)
        }
      }

      const textNode = textRef.current[visualId]
      const visual = visualsRef.current[visualId]
      if (textNode && visual) {
        textNode.x(newX + visual.labelOffset.x)
        textNode.y(newY + visual.labelOffset.y)
      }

      setVisuals((prev) => ({
        ...prev,
        [visualId]: { ...prev[visualId], x: newX, y: newY },
      }))
    },
    [setVisuals, lineRef, textRef, visualsRef, lines]
  )

  const handleDragEnd = useCallback(
    async (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => {
      const newX = e.target.x()
      const newY = e.target.y()

      try {
        await saveVisualPosition(visualId, newX, newY)
      } catch (error) {
        console.error('Failed to save visual position:', error)
      }

      setVisuals((prev) => ({
        ...prev,
        [visualId]: { ...prev[visualId], x: newX, y: newY },
      }))

      setDragging(false)
    },
    [saveVisualPosition, setDragging, setVisuals]
  )

  return (
    <>
      {Object.values(visuals).map((visual) => {
        const stationIds = visualToStations[visual.id] || []
        const isTransfer = visual.isTransfer || stationIds.length > 1
        const color = getStationColor(visual.id)

        return (
          <Circle
            key={visual.id}
            ref={(node) => {
              if (node) {
                circleRef.current[visual.id] = node
              }
            }}
            x={visual.x}
            y={visual.y}
            radius={isTransfer ? 16 : 10}
            fill={'none'}
            stroke={color}
            strokeWidth={isTransfer ? 3 : 2}
            draggable
            onDragStart={handleDragStart}
            onDragMove={(e) => handleDragMove(e, visual.id)}
            onDragEnd={(e) => handleDragEnd(e, visual.id)}
          />
        )
      })}
    </>
  )
}
