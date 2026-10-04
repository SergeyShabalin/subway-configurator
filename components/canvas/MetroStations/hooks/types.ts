import { VisualData } from '@/components/canvas/MetroStations/types'
import { MutableRefObject } from 'react'

export interface UseMetroStationsParams {
  visuals: Record<string, VisualData>
  visualsRef: MutableRefObject<Record<string, VisualData>>
}

export interface UseMetroStationsReturn {
  visualData: Record<string, StationData>
}

export interface StationData {
  color: string
  colors?: Array<string>
  isTransfer: boolean
}
