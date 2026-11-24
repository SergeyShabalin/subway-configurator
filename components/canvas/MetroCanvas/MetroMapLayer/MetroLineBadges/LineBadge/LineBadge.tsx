'use client'

import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { memo } from 'react'
import { Group } from 'react-konva'

import type { BadgeAppearance, BadgeGeometry } from '../types'
import { resetCursor, setPointerCursor, stopEventPropagation } from '../utils/konvaEvents'
import { LineBadgeShape } from './LineBadgeShape'
import { LineBadgeText } from './LineBadgeText'

interface LineBadgeProps {
  x: number
  y: number
  text: string
  geometry: BadgeGeometry
  appearance: BadgeAppearance
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
}

export const LineBadge = memo(({ x, y, text, geometry, appearance, onDragEnd }: LineBadgeProps) => {
  const isDragEnabled = useMetroStore((state) => state.isDragEnabled)
  const isInteractive = isDragEnabled && !appearance.isDimmed

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd(e)

    const stage = e.target.getStage()

    if (!stage) return

    const pointer = stage.getPointerPosition()

    if (!pointer) {
      resetCursor(e)
      return
    }

    const shape = stage.getIntersection(pointer)

    stage.container().style.cursor =
      shape && (shape === e.target || e.target.isAncestorOf(shape)) ? 'grab' : 'default'
  }

  return (
    <Group
      x={x}
      y={y}
      draggable={isInteractive}
      listening={isInteractive}
      onDragEnd={handleDragEnd}
      onMouseEnter={setPointerCursor}
      onMouseLeave={resetCursor}
      onMouseDown={stopEventPropagation}
    >
      <LineBadgeShape geometry={geometry} fill={appearance.fill} />

      <LineBadgeText text={text} geometry={geometry} color={appearance.textColor} />
    </Group>
  )
})

LineBadge.displayName = 'LineBadge'
