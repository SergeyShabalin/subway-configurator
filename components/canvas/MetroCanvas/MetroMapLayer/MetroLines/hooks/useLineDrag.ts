import { linesService, visualsService } from '@/src/lib/services'
import { useMetroStore, useMetroStoreApi } from '@/store'
import type { LineCircle, Point } from '@/types/metro'
import type Konva from 'konva'

/** Сдвиг (в координатах сцены), ниже которого нажатие не считается переносом */
const MOVE_THRESHOLD = 3

export type LineDragStartEvent = Konva.KonvaEventObject<MouseEvent | TouchEvent>

const shiftCircle = (circle: LineCircle | undefined, delta: Point): LineCircle | undefined =>
  circle && { ...circle, center: { x: circle.center.x + delta.x, y: circle.center.y + delta.y } }

export const useLineDrag = () => {
  const store = useMetroStoreApi()
  const updateVisualPositions = useMetroStore((s) => s.updateVisualPositions)
  const updateLineCircle = useMetroStore((s) => s.updateLineCircle)

  const startDrag = (lineId: string, e: LineDragStartEvent) => {
    const stage = e.target.getStage()
    const startPointer = stage?.getRelativePointerPosition()
    const { linesById, visuals } = store.getState()
    const line = linesById[lineId]
    if (!stage || !startPointer || !line) return

    // Не даём сцене начать собственное перетаскивание
    e.cancelBubble = true

    const origin = line.visualStationIds.flatMap((id) => {
      const v = visuals[id]
      return v ? [{ id: v.id, x: v.x, y: v.y }] : []
    })
    const originCircle = line.circle

    let delta: Point = { x: 0, y: 0 }
    let hasMoved = false

    const shiftedOrigin = (d: Point) =>
      origin.map((v) => ({ id: v.id, x: v.x + d.x, y: v.y + d.y }))

    const handleMove = () => {
      const pointer = stage.getRelativePointerPosition()
      if (!pointer) return

      delta = { x: pointer.x - startPointer.x, y: pointer.y - startPointer.y }
      if (!hasMoved && Math.hypot(delta.x, delta.y) < MOVE_THRESHOLD) return

      hasMoved = true
      updateVisualPositions(shiftedOrigin(delta))
      if (originCircle) updateLineCircle(lineId, shiftCircle(originCircle, delta))
    }

    const handleEnd = async () => {
      stage.off('.lineMove')
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchend', handleEnd)

      if (!hasMoved) return

      try {
        await visualsService.updatePositions(shiftedOrigin(delta))
        if (originCircle) await linesService.setCircle(lineId, shiftCircle(originCircle, delta))
      } catch {
        updateVisualPositions(origin)
        if (originCircle) updateLineCircle(lineId, originCircle)
      }
    }

    stage.on('mousemove.lineMove touchmove.lineMove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchend', handleEnd)
  }

  return { startDrag }
}
