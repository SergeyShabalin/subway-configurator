export type DeleteScope = { type: 'all' } | { type: 'line'; stationId: string }

export interface LineOption {
  stationId: string
  lineId: string
  lineName: string
  lineColor: string
}

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
