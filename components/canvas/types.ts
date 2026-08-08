export interface ApiVisual {
  id: string
  x: number
  y: number
  labelOffset: { x: number; y: number }
  isTransfer: boolean
}

export interface ApiStation {
  id: string
  name: string
  lineId: string
}

export interface ApiResponse {
  visuals: Array<ApiVisual>
  stations: Array<ApiStation>
  lines: Array<{
    id: string
    name: string
    color: string
    isCircular: boolean
    visualStationIds: Array<string>
    logicalStationIds: Array<string>
  }>
  segments: Array<{
    id: string
    fromStationId: string
    toStationId: string
    timeMinutes: number
  }>
  visualToStations: Record<string, Array<string>>
}
