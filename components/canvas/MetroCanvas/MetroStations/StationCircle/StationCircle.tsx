'use client'

import { CANVAS_HOVER_COLOR, CANVAS_STATION_FILL } from '@/components/canvas/shared/themeColors'
import { useTheme } from '@/context/theme-context'
import type Konva from 'konva'
import { memo, useRef, useState } from 'react'
import { Circle } from 'react-konva'
import type { StationCircleProps } from './types'

const BASE_RADIUS = 7
const TRANSFER_BASE_RADIUS = 12
const RING_STEP = 2.5
const RING_WIDTH = 2.5
const MIN_RING_RADIUS = 3
const DRAG_THRESHOLD = 2
const HOVER_SHADOW_BLUR = 4

const StationCircle = memo(
  ({
    visual,
    isTransfer,
    color,
    colors,
    stationId,
    onDragStart,
    onDragMove,
    onDragEnd,
    onStationClick,
  }: StationCircleProps) => {
    const { theme } = useTheme()
    const [isHovered, setIsHovered] = useState(false)
    const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)

    if (!visual) return null

    const fillColor = CANVAS_STATION_FILL[theme]
    const hoverColor = CANVAS_HOVER_COLOR[theme]

    const multiColors = isTransfer && colors && colors.length >= 2 ? colors : null
    const baseRadius = multiColors ? TRANSFER_BASE_RADIUS : BASE_RADIUS
    const strokeColor = color || '#888888'
    const strokeWidth = RING_WIDTH

    const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage()
      if (stage) stage.container().style.cursor = 'pointer'
      setIsHovered(true)
    }

    const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage()
      if (stage) stage.container().style.cursor = 'default'
      setIsHovered(false)
    }

    const handleMouseDown = () => {
      dragStartPosRef.current = null
    }

    const handleStationDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
      const node: Konva.Node = e.target
      dragStartPosRef.current = { x: node.x(), y: node.y() }
      onDragStart()
    }

    const handleStationMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
      const node: Konva.Node = e.target
      const start = dragStartPosRef.current

      if (!start) {
        onStationClick?.(stationId)
        return
      }

      const dx = node.x() - start.x
      const dy = node.y() - start.y
      const moved = Math.sqrt(dx * dx + dy * dy)

      if (moved < DRAG_THRESHOLD) {
        onStationClick?.(stationId)
      }

      dragStartPosRef.current = null
    }

    const handleStationTap = () => {
      onStationClick?.(stationId)
    }

    const hoverShadowProps = {
      shadowColor: isHovered ? hoverColor : undefined,
      shadowBlur: isHovered ? HOVER_SHADOW_BLUR : 0,
      shadowOpacity: isHovered ? 1 : 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    }

    if (!multiColors) {
      return (
        <Circle
          x={visual.x ?? 0}
          y={visual.y ?? 0}
          radius={baseRadius}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          {...hoverShadowProps}
          draggable
          onMouseDown={handleMouseDown}
          onDragStart={handleStationDragStart}
          onDragMove={(e) => onDragMove(e, visual.id)}
          onDragEnd={(e) => onDragEnd(e, visual.id)}
          onMouseUp={handleStationMouseUp}
          onTap={handleStationTap}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )
    }

    return (
      <>
        <Circle
          x={visual.x ?? 0}
          y={visual.y ?? 0}
          radius={baseRadius}
          fill={fillColor}
          stroke={multiColors[0] ?? color}
          strokeWidth={strokeWidth}
          {...hoverShadowProps}
          draggable
          onMouseDown={handleMouseDown}
          onDragStart={handleStationDragStart}
          onDragMove={(e) => onDragMove(e, visual.id)}
          onDragEnd={(e) => onDragEnd(e, visual.id)}
          onMouseUp={handleStationMouseUp}
          onTap={handleStationTap}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        {multiColors.slice(1).map((c: string, index: number) => {
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
              {...hoverShadowProps}
              listening={false}
            />
          )
        })}
      </>
    )
  }
)

StationCircle.displayName = 'StationCircle'

export { StationCircle }
