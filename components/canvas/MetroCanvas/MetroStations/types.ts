import { VisualStation } from '@/types/metro'
import type Konva from 'konva'
import { MutableRefObject } from 'react'

export interface MetroStationsProps {
  circleRef?: MutableRefObject<Record<string, Konva.Circle>>
  lineRef: MutableRefObject<Record<string, Konva.Line>>
  textRef: MutableRefObject<Record<string, Konva.Text>>
  onStationClick: (stationId: string) => void
}

export interface StationData {
  color: string
  colors?: Array<string>
  isTransfer: boolean
}

export type VisualData = VisualStation
