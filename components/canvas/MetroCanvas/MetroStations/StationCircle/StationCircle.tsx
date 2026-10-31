'use client'

import { CANVAS_DIMMED_COLOR } from '@/components/canvas/shared/dimmedColors'
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

interface StationCircleUIProps extends StationCircleProps {
  isLocked: boolean
}

const StationCircleUI = memo(
  ({
    visual,
    isTransfer,
    color,
    colors,
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

    const multiColors = isTransfer && colors && colors.length >= 2 ? colors : null
    const baseRadius = multiColors ? TRANSFER_BASE_RADIUS : BASE_RADIUS
    const strokeColor = isDimmed ? dimmedColor : color || '#888888'
    const strokeWidth = RING_WIDTH

    // События навешиваются только если элемент не заблокирован
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
          stroke={multiColors[0] ?? color}
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
              stroke={c}
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

// Экспортируем оригинальный компонент, который сам решает, заблокирован ли он
export const StationCircle = (props: StationCircleProps) => {
  // В оригинальном компоненте isDimmed приходит снаружи из MetroStations
  return <StationCircleUI {...props} isLocked={props.isDimmed ?? false} />
}

StationCircle.displayName = 'StationCircle'
