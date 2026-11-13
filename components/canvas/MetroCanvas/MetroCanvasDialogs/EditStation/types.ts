import { StationOnLine } from '@/components/canvas/shared/options/lineLookup'

export type DeleteScope = { type: 'all' } | { type: 'line'; stationId: string }

export type LineOption = StationOnLine

export interface TransferItem {
  id: string
  otherStationName: string
  timeMinutes: number
  color?: string
}

export interface EditStationData {
  stationName: string
  currentLineName?: string
  currentLineColor?: string
  transfers: Array<TransferItem>
  transferCount: number
  lineOptions: Array<LineOption>
  fromVisualId?: string
  existingTransferIds: Array<string>
}
