import { useMetroStore } from '@/store'
import type { VisualStation } from '@/types/metro'
import type Konva from 'konva'
import { useRef, useState } from 'react'
import type { StationHandlers } from '../../types'
import { DRAG_THRESHOLD } from '../constants'

interface UseStationInteractionParams {
  visual: VisualStation
  stationId: string
  handlers: StationHandlers
  isLocked: boolean
}

export const useStationInteraction = ({
  visual,
  stationId,
  handlers,
  isLocked,
}: UseStationInteractionParams) => {
  const { onDragStart, onDragMove, onDragEnd, onStationClick } = handlers

  const isDragEnabled = useMetroStore((state) => state.isDragEnabled)
  const [isHovered, setIsHovered] = useState(false)
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)

  const hoverProps = {
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

  // noinspection JSUnusedGlobalSymbols
  const dragProps = {
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
    ...hoverProps,
  }

  // Без перетаскивания: только клик. Konva не шлёт click после панорамирования Stage.
  const clickOnlyProps = {
    onClick: () => onStationClick?.(stationId),
    onTap: () => onStationClick?.(stationId),
    ...hoverProps,
  }

  const interactiveProps = isLocked
    ? { listening: false }
    : isDragEnabled
      ? dragProps
      : clickOnlyProps

  return { isHovered, interactiveProps }
}
