import type Konva from 'konva'
import { useState } from 'react'
import type { Segment } from '../helpers/buildSegments'
import type { MetroLinesProps } from '../types'
import type { LineDragStartEvent } from './useLineDrag'

export const useSegmentInteraction = (
  segment: Segment,
  lineId: string,
  isDimmed: boolean,
  isMovable: boolean,
  onSegmentClick: MetroLinesProps['onSegmentClick'],
  onLineDragStart: (lineId: string, e: LineDragStartEvent) => void
) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true
    onSegmentClick?.({ lineId, fromVisualId: segment.fromId, toVisualId: segment.toId })
  }

  const handleDragStart = (e: LineDragStartEvent) => onLineDragStart(lineId, e)

  const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (stage) stage.container().style.cursor = isMovable ? 'move' : 'pointer'
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
        onClick: isMovable ? undefined : handleClick,
        onTap: isMovable ? undefined : handleClick,
        onMouseDown: isMovable ? handleDragStart : undefined,
        onTouchStart: isMovable ? handleDragStart : undefined,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      }

  return { isHovered, interactiveProps }
}
