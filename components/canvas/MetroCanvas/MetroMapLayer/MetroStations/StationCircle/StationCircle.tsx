'use client'

import { CANVAS_DIMMED_COLOR } from '@/components/canvas/shared/dimmedColors'
import { CANVAS_HOVER_COLOR, CANVAS_STATION_FILL } from '@/components/canvas/shared/themeColors'
import { useTheme } from '@/context/theme-context'
import type Konva from 'konva'
import { memo, useRef, useState } from 'react'
import { Circle } from 'react-konva'
import type { StationCircleProps } from '../types'
import {
  BASE_RADIUS,
  DRAG_THRESHOLD,
  HOVER_SHADOW_BLUR,
  MIN_RING_RADIUS,
  MULTI_LINE_BASE_RADIUS,
  RING_STEP,
  RING_WIDTH,
  TRANSFER_STATION_RADIUS,
} from './constants'

interface StationCircleUIProps extends StationCircleProps {
  isLocked: boolean
}

const StationCircleUI = memo(
  ({
    visual,
    isMultiLine,
    isTransferStation,
    color,
    colors,
    colorsActive,
    stationId,
    isDimmed = false,
    isLocked,
    onDragStart,
    onDragMove,
    onDragEnd,
    onStationClick,
  }: StationCircleUIProps) => {
    const { theme } = useTheme()
    const [isHovered, setIsHovered] = useState(false)
    const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)

    if (!visual) return null

    const fillColor = CANVAS_STATION_FILL[theme]
    const hoverColor = CANVAS_HOVER_COLOR[theme]
    const dimmedColor = CANVAS_DIMMED_COLOR[theme]

    const baseRadius = isMultiLine
      ? MULTI_LINE_BASE_RADIUS
      : isTransferStation
        ? TRANSFER_STATION_RADIUS
        : BASE_RADIUS

    const strokeColor = isDimmed ? dimmedColor : color || '#888888'
    const strokeWidth = RING_WIDTH

    const multiColors = isMultiLine && colors && colors.length >= 2 ? colors : null

    const ringColor = (c: string, index: number) =>
      colorsActive?.[index] === false ? dimmedColor : c

    const interactiveProps = isLocked
      ? { listening: false }
      : {
          draggable: true,
          onMouseDown: () => {
            dragStartPosRef.current = null
          },
          onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => {
            const node: Konva.Node = e.target
            dragStartPosRef.current = { x: node.x(), y: node.y() }
            onDragStart()
          },
          onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e, visual.id),
          onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(e, visual.id),
          onMouseUp: (e: Konva.KonvaEventObject<MouseEvent>) => {
            const node: Konva.Node = e.target
            const start = dragStartPosRef.current
            if (!start) {
              onStationClick?.(stationId)
              return
            }
            const dx = node.x() - start.x
            const dy = node.y() - start.y
            if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) {
              onStationClick?.(stationId)
            }
            dragStartPosRef.current = null
          },
          onTap: () => onStationClick?.(stationId),
          onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
            const stage = e.target.getStage()
            if (stage) stage.container().style.cursor = 'pointer'
            setIsHovered(true)
          },
          onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
            const stage = e.target.getStage()
            if (stage) stage.container().style.cursor = 'default'
            setIsHovered(false)
          },
        }

    const hoverShadowProps = {
      shadowColor: isHovered && !isLocked ? hoverColor : undefined,
      shadowBlur: isHovered && !isLocked ? HOVER_SHADOW_BLUR : 0,
      shadowOpacity: isHovered && !isLocked ? 1 : 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    }

    if (!multiColors || isDimmed) {
      return (
        <Circle
          x={visual.x ?? 0}
          y={visual.y ?? 0}
          radius={baseRadius}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          {...hoverShadowProps}
          {...interactiveProps}
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
          stroke={ringColor(multiColors[0], 0)}
          strokeWidth={strokeWidth}
          {...hoverShadowProps}
          {...interactiveProps}
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
              stroke={ringColor(c, index + 1)}
              strokeWidth={RING_WIDTH}
              listening={false}
            />
          )
        })}
      </>
    )
  }
)

StationCircleUI.displayName = 'StationCircleUI'

export const StationCircle = (props: StationCircleProps) => {
  return <StationCircleUI {...props} isLocked={props.isDimmed ?? false} />
}

StationCircle.displayName = 'StationCircle'
