'use client'

import { useRoute } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { CANVAS_DIMMED_COLOR } from '@/components/canvas/shared/dimmedColors'
import { CANVAS_HOVER_COLOR } from '@/components/canvas/shared/themeColors'
import { useTheme } from '@/context/theme-context'
import type Konva from 'konva'
import { memo, useCallback, useMemo, useState } from 'react'
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

interface SegmentItem {
  segment: Segment
  lineId: string
  color: string
  isDimmed: boolean
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

interface SegmentPathProps {
  segmentKey: string
  path: string
  fromId: string
  toId: string
  lineId: string
  color: string
  hoverColor: string
  isDimmed: boolean
  lineRef: MetroLinesProps['lineRef']
  onSegmentClick: MetroLinesProps['onSegmentClick']
}

const SegmentPath = memo(
  ({
    segmentKey,
    path,
    fromId,
    toId,
    lineId,
    color,
    hoverColor,
    isDimmed,
    lineRef,
    onSegmentClick,
  }: SegmentPathProps) => {
    const [isHovered, setIsHovered] = useState(false)

    const setRef = useCallback(
      (node: Konva.Path | null) => {
        if (node) {
          lineRef.current[segmentKey] = node as unknown as Konva.Line
        }
      },
      [lineRef, segmentKey]
    )

    const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.cancelBubble = true
      onSegmentClick?.({ lineId, fromVisualId: fromId, toVisualId: toId })
    }

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

    // Формируем пропсы интерактивности динамически
    const interactiveProps = isDimmed
      ? { listening: false }
      : {
          listening: true,
          onClick: handleClick,
          onTap: handleClick,
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        }

    return (
      <Path
        ref={setRef}
        perfectDrawEnabled={false}
        data={path}
        shadowColor={isHovered ? hoverColor : undefined}
        shadowBlur={isHovered ? 3 : 0}
        shadowOpacity={isHovered ? 1 : 0}
        stroke={color}
        strokeWidth={6}
        lineCap="round"
        lineJoin="round"
        hitStrokeWidth={20}
        {...interactiveProps}
      />
    )
  }
)

SegmentPath.displayName = 'SegmentPath'

export const MetroLines = memo(({ visuals, lineRef, onSegmentClick }: MetroLinesProps) => {
  const { theme } = useTheme()
  const { lineData } = useMetroLines()
  const route = useRoute()
  const dimmedColor = CANVAS_DIMMED_COLOR[theme]

  const hoverColor = CANVAS_HOVER_COLOR[theme]
  const routeKeys = route?.segmentKeys

  const items = useMemo<Array<SegmentItem>>(() => {
    const result: Array<SegmentItem> = []

    for (const line of lineData) {
      const segments = buildSegments(line.id, line.visualStationIds, line.isCircular, visuals)

      for (const segment of segments) {
        result.push({
          segment,
          lineId: String(line.id),
          color: line.color,
          isDimmed: routeKeys ? !routeKeys.has(segment.key) : false,
        })
      }
    }

    // Без маршрута порядок прежний. С маршрутом: сначала серые, поверх них маршрут
    return routeKeys
      ? [...result.filter((i) => i.isDimmed), ...result.filter((i) => !i.isDimmed)]
      : result
  }, [lineData, visuals, routeKeys])

  return (
    <>
      {items.map(({ segment, lineId, color, isDimmed }) => (
        <SegmentPath
          key={segment.key}
          segmentKey={segment.key}
          path={segment.path}
          fromId={segment.fromId}
          toId={segment.toId}
          lineId={lineId}
          color={isDimmed ? dimmedColor : color}
          hoverColor={hoverColor}
          isDimmed={isDimmed}
          lineRef={lineRef}
          onSegmentClick={onSegmentClick}
        />
      ))}
    </>
  )
})

MetroLines.displayName = 'MetroLines'
