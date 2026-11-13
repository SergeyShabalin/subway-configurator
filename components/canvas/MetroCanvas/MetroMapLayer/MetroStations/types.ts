import { TransferDropApi } from '@/components/canvas/MetroCanvas/MetroMapLayer/MetroStations/TransferDrop/types'
import type { VisualStation } from '@/types/metro'
import type Konva from 'konva'

export type VisualData = Pick<VisualStation, 'id' | 'x' | 'y'>

export interface StationAppearance {
  isMultiLine: boolean
  isTransferStation: boolean
  color?: string
  colors?: Array<string>
  colorsActive?: Array<boolean>
}

export interface StationHandlers {
  onDragStart: () => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => void
  onStationClick?: (stationId: string) => void
}

export interface MetroStationsProps {
  lineRef: React.MutableRefObject<Record<string, Konva.Line>>
  textRef: React.MutableRefObject<Record<string, Konva.Text>>
  transferDrop: TransferDropApi
  onStationClick?: (stationId: string) => void
}

export interface StationCircleProps {
  visual: VisualStation
  appearance: StationAppearance
  stationId: string
  isDimmed?: boolean
  handlers: StationHandlers
}
