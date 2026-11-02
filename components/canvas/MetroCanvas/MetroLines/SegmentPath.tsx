'use client'

import type { LineType } from '@/types/metro'
import type Konva from 'konva'
import { memo, useCallback, useState } from 'react'
import { Path } from 'react-konva'
import type { Segment } from './buildSegments'
import { HIT_STROKE_WIDTH, RAIL_GAP, RAIL_LINE_WIDTH, SUBWAY_WIDTH } from './constants'
import { bezierToPath } from './geometry/bezier'
import { offsetBezier } from './geometry/offsetBezier'
import type { MetroLinesProps } from './types'

export interface SegmentPathProps {
  segment: Segment
  lineId: string
  lineType: LineType
  color: string
  hoverColor: string
  isDimmed: boolean
  lineRef: MetroLinesProps['lineRef']
  onSegmentClick: MetroLinesProps['onSegmentClick']
}

const useSegmentInteraction = (
  segment: Segment,
  lineId: string,
  isDimmed: boolean,
  onSegmentClick: MetroLinesProps['onSegmentClick']
) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true
    onSegmentClick?.({ lineId, fromVisualId: segment.fromId, toVisualId: segment.toId })
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

  const interactiveProps = isDimmed
    ? { listening: false }
    : {
        listening: true,
        onClick: handleClick,
        onTap: handleClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      }

  return { isHovered, interactiveProps }
}

const useRegisterRef = (lineRef: MetroLinesProps['lineRef'], segmentKey: string, suffix: string) =>
  useCallback(
    (node: Konva.Path | null) => {
      if (node) lineRef.current[`${segmentKey}${suffix}`] = node as unknown as Konva.Line
    },
    [lineRef, segmentKey, suffix]
  )

const shadowProps = (isHovered: boolean, hoverColor: string) => ({
  shadowColor: isHovered ? hoverColor : undefined,
  shadowBlur: isHovered ? 3 : 0,
  shadowOpacity: isHovered ? 1 : 0,
})

const SubwayPath = ({
  segment,
  color,
  isHovered,
  hoverColor,
  interactiveProps,
  refCb,
}: {
  segment: Segment
  color: string
  isHovered: boolean
  hoverColor: string
  interactiveProps: object
  refCb: (node: Konva.Path | null) => void
}) => (
  <Path
    ref={refCb}
    perfectDrawEnabled={false}
    data={segment.path}
    {...shadowProps(isHovered, hoverColor)}
    stroke={color}
    strokeWidth={SUBWAY_WIDTH}
    lineCap="round"
    lineJoin="round"
    hitStrokeWidth={HIT_STROKE_WIDTH}
    {...interactiveProps}
  />
)

const RailPath = ({
  segment,
  color,
  isHovered,
  hoverColor,
  interactiveProps,
  leftRef,
  rightRef,
}: {
  segment: Segment
  color: string
  isHovered: boolean
  hoverColor: string
  interactiveProps: object
  leftRef: (node: Konva.Path | null) => void
  rightRef: (node: Konva.Path | null) => void
}) => {
  const half = RAIL_GAP / 2
  const left = offsetBezier(segment.bezier, -half)
  const right = offsetBezier(segment.bezier, half)

  const shared = {
    perfectDrawEnabled: false,
    stroke: color,
    strokeWidth: RAIL_LINE_WIDTH,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
    ...shadowProps(isHovered, hoverColor),
  }

  return (
    <>
      <Path
        ref={leftRef}
        data={bezierToPath(left)}
        {...shared}
        hitStrokeWidth={HIT_STROKE_WIDTH}
        {...interactiveProps}
      />
      <Path ref={rightRef} data={bezierToPath(right)} {...shared} listening={false} />
    </>
  )
}

export const SegmentPath = memo(
  ({
    segment,
    lineId,
    lineType,
    color,
    hoverColor,
    isDimmed,
    lineRef,
    onSegmentClick,
  }: SegmentPathProps) => {
    const { isHovered, interactiveProps } = useSegmentInteraction(
      segment,
      lineId,
      isDimmed,
      onSegmentClick
    )

    const mainRef = useRegisterRef(
      lineRef,
      segment.key,
      lineType === 'commuter_rail' ? ':left' : ''
    )
    const rightRef = useRegisterRef(lineRef, segment.key, ':right')

    const isRail = lineType === 'commuter_rail'

    return isRail ? (
      <RailPath
        segment={segment}
        color={color}
        isHovered={isHovered}
        hoverColor={hoverColor}
        interactiveProps={interactiveProps}
        leftRef={mainRef}
        rightRef={rightRef}
      />
    ) : (
      <SubwayPath
        segment={segment}
        color={color}
        isHovered={isHovered}
        hoverColor={hoverColor}
        interactiveProps={interactiveProps}
        refCb={mainRef}
      />
    )
  }
)

SegmentPath.displayName = 'SegmentPath'
