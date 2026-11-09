import type Konva from 'konva'

interface CreateBadgeDragHandlerParams {
  onMove: (x: number, y: number) => void
}

export const createBadgeDragHandler = ({ onMove }: CreateBadgeDragHandlerParams) => {
  return (e: Konva.KonvaEventObject<DragEvent>) => {
    onMove(e.target.x(), e.target.y())
  }
}
