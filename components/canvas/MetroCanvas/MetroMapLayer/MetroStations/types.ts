import { TransferDropApi } from '@/components/canvas/MetroCanvas/transferDrop/types'
import type { VisualStation } from '@/types/metro'
import type Konva from 'konva'

export type VisualData = Pick<VisualStation, 'id' | 'x' | 'y'>

export interface StationData {
  isMultiLine: boolean
  isTransferStation: boolean
  color?: string
  colors?: Array<string>
}

export interface MetroStationsProps {
  lineRef: React.MutableRefObject<Record<string, Konva.Line>>
  textRef: React.MutableRefObject<Record<string, Konva.Text>>
  transferDrop: TransferDropApi
  onStationClick?: (stationId: string) => void
}

export interface StationCircleProps {
  visual: VisualStation
  isMultiLine: boolean
  isTransferStation: boolean
  color?: string
  colors?: Array<string>
  stationId: string
  isDimmed?: boolean
  onDragStart: () => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => void
  onStationClick?: (stationId: string) => void
}
