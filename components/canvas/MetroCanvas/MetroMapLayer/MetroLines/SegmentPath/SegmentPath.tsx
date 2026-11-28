'use client'

import type { LineType } from '@/types/metro'
import { memo } from 'react'
import type { Segment } from '../helpers/buildSegments'
import { getLineStroke } from '../helpers/lineStroke'
import type { LineDragStartEvent } from '../hooks/useLineDrag'
import { useRegisterRef } from '../hooks/useRegisterRef'
import { useSegmentInteraction } from '../hooks/useSegmentInteraction'
import type { MetroLinesProps } from '../types'
import { RailPath } from './RailPath/RailPath'
import { SubwayPath } from './SubwayPath/SubwayPath'

export interface SegmentPathProps {
  segment: Segment
  lineId: string
  lineType: LineType
  color: string
  hoverColor: string
  /** Множитель толщины линии (1 — по умолчанию) */
  widthScale: number
  isDimmed: boolean
  /** Линия выбрана для переноса: сегмент тянется вместо клика */
  isMovable: boolean
  lineRef: MetroLinesProps['lineRef']
  onSegmentClick: MetroLinesProps['onSegmentClick']
  onLineDragStart: (lineId: string, e: LineDragStartEvent) => void
}

/** Сегментов на карте много, а родитель перерисовывается при перетаскивании: memo здесь оправдан. */
export const SegmentPath = memo(
  ({
    segment,
    lineId,
    lineType,
    color,
    hoverColor,
    widthScale,
    isDimmed,
    isMovable,
    lineRef,
    onSegmentClick,
    onLineDragStart,
  }: SegmentPathProps) => {
    const { isHovered, interactiveProps } = useSegmentInteraction(
      segment,
      lineId,
      isDimmed,
      isMovable,
      onSegmentClick,
      onLineDragStart
    )

    const isRail = lineType === 'commuter_rail'
    const mainRef = useRegisterRef(lineRef, segment.key, isRail ? ':left' : '')
    const rightRef = useRegisterRef(lineRef, segment.key, ':right')
    const stroke = getLineStroke(lineType, widthScale)

    const visual = { segment, color, isHovered, hoverColor, interactiveProps }

    return isRail ? (
      <RailPath {...visual} stroke={stroke} leftRef={mainRef} rightRef={rightRef} />
    ) : (
      <SubwayPath {...visual} stroke={stroke} refCb={mainRef} />
    )
  }
)

SegmentPath.displayName = 'SegmentPath'
