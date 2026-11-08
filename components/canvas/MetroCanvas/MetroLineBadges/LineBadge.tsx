'use client'

import type { LineType } from '@/types/metro'
import type Konva from 'konva'
import { memo } from 'react'
import { Circle, Group, Line, Text } from 'react-konva'

const CIRCLE_RADIUS = 13
const RAIL_HEIGHT = 22
const RAIL_MIN_WIDTH = 34
const RAIL_SKEW = 6
const CHAR_WIDTH = 8

/** Чёрный или белый текст в зависимости от яркости фона. */
const textColorFor = (hex: string): string => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!match) return '#ffffff'

  const n = parseInt(match[1], 16)
  const luminance = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
  return luminance > 160 ? '#000000' : '#ffffff'
}

interface LineBadgeProps {
  x: number
  y: number
  text: string
  lineType: LineType
  color: string
  fill: string
  isDimmed: boolean
  onDragEnd: (x: number, y: number) => void
}

export const LineBadge = memo(
  ({ x, y, text, lineType, color, fill, isDimmed, onDragEnd }: LineBadgeProps) => {
    const isRail = lineType === 'commuter_rail'

    const width = isRail
      ? Math.max(RAIL_MIN_WIDTH, text.length * CHAR_WIDTH + RAIL_SKEW * 2 + 8)
      : CIRCLE_RADIUS * 2
    const height = isRail ? RAIL_HEIGHT : CIRCLE_RADIUS * 2
    const fontSize = !isRail && text.length > 2 ? 11 : 14

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
      onDragEnd(e.target.x(), e.target.y())
    }

    return (
      <Group
        x={x}
        y={y}
        draggable={!isDimmed}
        listening={!isDimmed}
        onDragEnd={handleDragEnd}
        onMouseDown={(e) => {
          e.cancelBubble = true
        }}
        onMouseEnter={(e) => {
          const stage = e.target.getStage()
          if (stage) stage.container().style.cursor = 'pointer'
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage()
          if (stage) stage.container().style.cursor = 'default'
        }}
      >
        {isRail ? (
          <Line
            closed
            points={[
              -width / 2 + RAIL_SKEW,
              -height / 2,
              width / 2,
              -height / 2,
              width / 2 - RAIL_SKEW,
              height / 2,
              -width / 2,
              height / 2,
            ]}
            fill={fill}
            lineJoin="round"
            perfectDrawEnabled={false}
          />
        ) : (
          <Circle radius={CIRCLE_RADIUS} fill={fill} perfectDrawEnabled={false} />
        )}

        <Text
          text={text}
          width={width}
          height={height}
          offsetX={width / 2}
          offsetY={height / 2}
          align="center"
          verticalAlign="middle"
          fontStyle="bold"
          fontSize={fontSize}
          fill={isDimmed ? '#151414' : textColorFor(color)}
          listening={false}
        />
      </Group>
    )
  }
)

LineBadge.displayName = 'LineBadge'
