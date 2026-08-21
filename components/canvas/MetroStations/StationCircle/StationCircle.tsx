'use client'

import { memo } from 'react'
import { Circle } from 'react-konva'
import type { StationCircleProps } from './types'

const StationCircle = memo(
  ({
    visual,
    isTransfer,
    color,
    colors,
    onDragStart,
    onDragMove,
    onDragEnd,
  }: StationCircleProps) => {
    if (!visual) return null

    const isMultiTransfer = isTransfer && colors && colors.length >= 2
    const radius = isMultiTransfer ? 16 : 10
    const strokeWidth = 2.5

    return (
      <>
        <Circle
          x={visual.x ?? 0}
          y={visual.y ?? 0}
          radius={radius}
          fill="#020913"
          stroke={isMultiTransfer ? colors[0] : color || '#888888'}
          strokeWidth={strokeWidth}
          draggable
          onDragStart={onDragStart}
          onDragMove={(e) => onDragMove(e, visual.id)}
          onDragEnd={(e) => onDragEnd(e, visual.id)}
        />
        {isMultiTransfer &&
          colors.slice(1).map((c: string, index: number) => {
            const innerRadius = 16 - (index + 1) * 2.5
            if (innerRadius < 4) return null
            return (
              <Circle
                key={`${visual.id}-inner-${index}`}
                x={visual.x ?? 0}
                y={visual.y ?? 0}
                radius={innerRadius}
                fill="#020913"
                stroke={c}
                strokeWidth={strokeWidth}
                listening={false}
              />
            )
          })}
      </>
    )
  },
  (prev: StationCircleProps, next: StationCircleProps) => {
    if (!prev.visual || !next.visual) return true
    return (
      prev.visual.x === next.visual.x &&
      prev.visual.y === next.visual.y &&
      prev.color === next.color &&
      prev.isTransfer === next.isTransfer &&
      prev.colors?.join(',') === next.colors?.join(',')
    )
  }
)

StationCircle.displayName = 'StationCircle'

export { StationCircle }
