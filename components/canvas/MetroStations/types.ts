import type Konva from 'konva'
import { MutableRefObject } from 'react'

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

export interface StationData {
  color: string
  colors?: Array<string>
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

export interface MetroStationsProps {
  visuals: Record<string, VisualData>
  circleRef?: MutableRefObject<Record<string, Konva.Circle>>
  lineRef: MutableRefObject<Record<string, Konva.Line>>
  textRef: MutableRefObject<Record<string, Konva.Text>>
  setVisuals: (
    value:
      | Record<string, VisualData>
      | ((prev: Record<string, VisualData>) => Record<string, VisualData>)
  ) => void
}
