import type Konva from 'konva'
import { useCallback, type RefObject } from 'react'
import { useMetroModal } from '../../hooks/useMetroModal'

/** Открытие модалки создания элемента: правый клик мышью или долгое нажатие. */
export const useCanvasContextMenu = (stageRef: RefObject<Konva.Stage | null>) => {
  const modal = useMetroModal()
  const { openModal } = modal

  const handleLongPress = useCallback(
    (worldX: number, worldY: number) => openModal(worldX, worldY),
    [openModal]
  )

  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      e.evt.preventDefault()

      const stage = stageRef.current
      const pointer = stage?.getPointerPosition()
      if (!stage || !pointer) return

      const world = stage.getAbsoluteTransform().copy().invert().point(pointer)
      openModal(world.x, world.y)
    },
    [stageRef, openModal]
  )

  return { modal, handleContextMenu, handleLongPress }
}
