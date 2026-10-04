import type Konva from 'konva'
import type { Dispatch, RefObject, SetStateAction } from 'react'

export interface UseStageZoomReturn {
  stageRef: RefObject<Konva.Stage | null>
  stageScale: number
  stagePosition: { x: number; y: number }
  setStageScale: Dispatch<SetStateAction<number>>
  setStagePosition: Dispatch<SetStateAction<{ x: number; y: number }>>
  handleWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void
  handleStageDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  centerStage: (points: Array<{ x: number; y: number }>, width?: number, height?: number) => void
}
