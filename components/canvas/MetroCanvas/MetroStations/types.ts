import { VisualStation } from '@/types/metro'
import type Konva from 'konva'

export interface MetroStationsProps {
  circleRef?: React.MutableRefObject<Record<string, Konva.Circle>>
  lineRef: React.MutableRefObject<Record<string, Konva.Line>>
  textRef: React.MutableRefObject<Record<string, Konva.Text>>
  onStationDoubleClick: (stationId: string) => void
}

export interface StationData {
  color: string
  colors?: Array<string>
  isTransfer: boolean
}

export type VisualData = VisualStation
