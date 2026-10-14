'use client'

import { memo } from 'react'
import { Circle } from 'react-konva'
import type { StationCircleProps } from './types'

const BASE_RADIUS = 7
const TRANSFER_BASE_RADIUS = 12
const RING_STEP = 2.5
const RING_WIDTH = 2.5
const MIN_RING_RADIUS = 3

const StationCircle = memo(
  ({
    visual,
    isTransfer,
    color,
    colors,
    onDragStart,
    onDragMove,
    onDragEnd,
    onDoubleClick,
  }: StationCircleProps) => {
    if (!visual) return null

    const isMultiTransfer = isTransfer && colors && colors.length >= 2
    const baseRadius = isMultiTransfer ? TRANSFER_BASE_RADIUS : BASE_RADIUS

    if (!isMultiTransfer) {
      return (
        <Circle
          x={visual.x ?? 0}
          y={visual.y ?? 0}
          radius={baseRadius}
          fill="#020913"
          stroke={color || '#888888'}
          strokeWidth={RING_WIDTH}
          draggable
          onDragStart={onDragStart}
          onDragMove={(e) => onDragMove(e, visual.id)}
          onDragEnd={(e) => onDragEnd(e, visual.id)}
          onDblClick={onDoubleClick}
        />
      )
    }

    return (
      <>
        <Circle
          x={visual.x ?? 0}
          y={visual.y ?? 0}
          radius={baseRadius}
          fill="#020913"
          stroke={colors[0]}
          strokeWidth={RING_WIDTH}
          draggable
          onDragStart={onDragStart}
          onDragMove={(e) => onDragMove(e, visual.id)}
          onDragEnd={(e) => onDragEnd(e, visual.id)}
          onDblClick={onDoubleClick}
        />

        {colors.slice(1).map((c: string, index: number) => {
          const innerRadius = baseRadius - (index + 1) * RING_STEP

          if (innerRadius < MIN_RING_RADIUS) return null

          return (
            <Circle
              key={`${visual.id}-inner-${index}`}
              x={visual.x ?? 0}
              y={visual.y ?? 0}
              radius={innerRadius}
              fill="transparent"
              stroke={c}
              strokeWidth={RING_WIDTH}
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
      prev.colors?.join(',') === next.colors?.join(',') &&
      prev.onDoubleClick === next.onDoubleClick
    )
  }
)

StationCircle.displayName = 'StationCircle'

export { StationCircle }
