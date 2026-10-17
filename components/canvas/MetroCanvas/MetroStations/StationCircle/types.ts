import type { VisualStation } from '@/types/metro'
import type Konva from 'konva'

export interface StationCircleProps {
  visual: VisualStation
  isTransfer: boolean
  color: string
  stationId: string
  colors?: Array<string>
  onDragStart: () => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => void
  onStationClick?: (stationId: string) => void
}
