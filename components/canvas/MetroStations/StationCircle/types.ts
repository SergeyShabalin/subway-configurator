import type Konva from 'konva'

export interface VisualData {
  id: string
  x: number
  y: number
  labelOffset: {
    x: number
    y: number
  }
  isTransfer: boolean
}

export interface StationCircleProps {
  visual: VisualData
  isTransfer: boolean
  color: string
  colors?: Array<string>
  onDragStart: () => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => void
}
