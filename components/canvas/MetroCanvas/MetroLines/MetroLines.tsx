'use client'

import { CANVAS_HOVER_COLOR } from '@/components/canvas/shared/themeColors'
import { useTheme } from '@/context/theme-context'
import type Konva from 'konva'
import { Fragment, useState } from 'react'
import { Path } from 'react-konva'
import { useMetroLines } from './hooks/useMetroLines'
import type { MetroLinesProps } from './types'

interface Point {
  x: number
  y: number
}

interface Segment {
  path: string
  key: string
  fromId: string
  toId: string
}

const DEFAULT_TENSION = 0.3
const TENSION_MULTIPLIER = 3
const CONTROL_POINT_DIVISOR = 6

const getControlPoints = (p0: Point, p1: Point, p2: Point, p3: Point, tension: number) => {
  const cp1x = p1.x + ((p2.x - p0.x) / CONTROL_POINT_DIVISOR) * tension * TENSION_MULTIPLIER
  const cp1y = p1.y + ((p2.y - p0.y) / CONTROL_POINT_DIVISOR) * tension * TENSION_MULTIPLIER
  const cp2x = p2.x - ((p3.x - p1.x) / CONTROL_POINT_DIVISOR) * tension * TENSION_MULTIPLIER
  const cp2y = p2.y - ((p3.y - p1.y) / CONTROL_POINT_DIVISOR) * tension * TENSION_MULTIPLIER

  return { cp1x, cp1y, cp2x, cp2y }
}

const buildSegmentPath = (
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  tension = DEFAULT_TENSION
) => {
  const { cp1x, cp1y, cp2x, cp2y } = getControlPoints(p0, p1, p2, p3, tension)
  return `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
}

const buildSegments = (
  lineId: string,
  visualIds: Array<string>,
  isCircular: boolean,
  visuals: MetroLinesProps['visuals']
): Array<Segment> => {
  const orderedIds = [...visualIds]
  if (isCircular && orderedIds.length > 0) {
    orderedIds.push(orderedIds[0])
  }

  const points: Array<Point & { id: string }> = []
  for (const visualId of orderedIds) {
    const visual = visuals[visualId]
    if (!visual) continue
    points.push({ id: visualId, x: visual.x, y: visual.y })
  }

  if (points.length < 2) return []

  const segments: Array<Segment> = []
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const p0 = points[i - 1] ?? (isCircular ? points[points.length - 2] : p1)
    const p3 = points[i + 2] ?? (isCircular ? points[1] : p2)

    segments.push({
      path: buildSegmentPath(p0, p1, p2, p3),
      key: `${lineId}-${p1.id}-${p2.id}`,
      fromId: p1.id,
      toId: p2.id,
    })
  }

  return segments
}

export const MetroLines = ({ visuals, lineRef, onSegmentClick }: MetroLinesProps) => {
  const { theme } = useTheme()
  const { lineData } = useMetroLines()
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const hoverColor = CANVAS_HOVER_COLOR[theme]

  const handleClick = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
    lineId: string,
    segment: Segment
  ) => {
    e.cancelBubble = true
    onSegmentClick?.({
      lineId,
      fromVisualId: segment.fromId,
      toVisualId: segment.toId,
    })
  }

  const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>, key: string) => {
    const stage = e.target.getStage()
    if (stage) stage.container().style.cursor = 'pointer'
    setHoveredKey(key)
  }

  const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (stage) stage.container().style.cursor = 'default'
    setHoveredKey(null)
  }

  return (
    <>
      {lineData.map((line) => {
        const segments = buildSegments(line.id, line.visualStationIds, line.isCircular, visuals)

        if (segments.length === 0) return null

        return (
          <Fragment key={line.id}>
            {segments.map((segment) => {
              const isHovered = hoveredKey === segment.key

              return (
                <Path
                  key={segment.key}
                  ref={(node) => {
                    if (node) {
                      lineRef.current[segment.key] = node as unknown as Konva.Line
                    }
                  }}
                  perfectDrawEnabled={false}
                  data={segment.path}
                  shadowColor={isHovered ? hoverColor : undefined}
                  shadowBlur={isHovered ? 3 : 0}
                  shadowOpacity={isHovered ? 1 : 0}
                  stroke={line.color}
                  strokeWidth={isHovered ? 6 : 6}
                  lineCap="round"
                  lineJoin="round"
                  hitStrokeWidth={20}
                  listening
                  onClick={(e) => handleClick(e, String(line.id), segment)}
                  onTap={(e) => handleClick(e, String(line.id), segment)}
                  onMouseEnter={(e) => handleMouseEnter(e, segment.key)}
                  onMouseLeave={handleMouseLeave}
                />
              )
            })}
          </Fragment>
        )
      })}
    </>
  )
}
