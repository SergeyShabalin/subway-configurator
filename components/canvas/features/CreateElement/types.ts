export interface CreateStationPayload {
  name: string
  lineId: string
  x: number
  y: number
  transferToVisualId?: string
  timeMinutes: number
}

export interface CreateLinePayload {
  name: string
  color: string
}

export interface TransferNode {
  visualId: string
  name: string
  lineIds: Array<string>
  colors: Array<string>
}
