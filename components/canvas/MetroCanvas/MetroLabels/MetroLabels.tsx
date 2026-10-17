'use client'

import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { useCallback, useState } from 'react'
import { Text } from 'react-konva'
import { useMetroLabels } from './hooks/useMetroLabels'
import type { MetroLabelsProps } from './types'

const LABEL_WIDTH = 60

export const MetroLabels = ({ stationNames, textRef, onLabelMove }: MetroLabelsProps) => {
  const visuals = useMetroStore((state) => state.visuals)

  const { labelData } = useMetroLabels(visuals, stationNames)

  const [hoveredLabelId, setHoveredLabelId] = useState<string | null>(null)

  const handleMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
    const stage = e.target.getStage()
    if (stage) stage.container().style.cursor = 'pointer'
    setHoveredLabelId(id)
  }, [])

  const handleMouseLeave = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (stage) stage.container().style.cursor = 'default'
    setHoveredLabelId(null)
  }, [])

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => {
      onLabelMove(visualId, e.target.x(), e.target.y())
    },
    [onLabelMove]
  )

  return (
    <>
      {labelData.map((label) => {
        const isHovered = hoveredLabelId === label.id

        return (
          <Text
            key={`label-${label.id}`}
            ref={(node) => {
              if (node) {
                textRef.current[label.id] = node
              }
            }}
            x={label.x}
            y={label.y}
            offsetX={LABEL_WIDTH / 2}
            text={label.text}
            fontSize={12}
            fontFamily="Arial"
            fill={isHovered ? '#fbc901' : '#e2e8f0'}
            align="center"
            verticalAlign="middle"
            listening
            draggable
            letterSpacing={2}
            stroke="#020913"
            strokeWidth={0.3}
            onMouseEnter={(e) => handleMouseEnter(e, label.id)}
            onMouseLeave={handleMouseLeave}
            onDragEnd={(e) => handleDragEnd(e, label.id)}
            onMouseDown={(e) => {
              e.cancelBubble = true
            }}
          />
        )
      })}
    </>
  )
}
