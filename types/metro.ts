export interface Line {
  id: string
  name: string
  color: string
  is_circular: number
  visualStationIds?: Array<string>
  logicalStationIds?: Array<string>
}

export interface Station {
  id: string
  name: string
  line_id: string
  createdAt?: number
}

export interface Visual {
  id: string
  x: number
  y: number
  label_x: number
  label_y: number
  is_transfer: number
}

export interface VisualStationLink {
  id: string
  visual_id: string
  station_id: string
}

export interface Segment {
  id: string
  from_station_id: string
  to_station_id: string
  line_id?: string
  time_minutes: number
}

export interface GraphData {
  lines: Array<{
    id: string
    name: string
    color: string
    isCircular: boolean
    visualStationIds: Array<string>
    logicalStationIds: Array<string>
  }>
  stations: Array<{
    id: string
    name: string
    lineId: string
  }>
  visuals: Array<{
    id: string
    x: number
    y: number
    labelOffset: {
      x: number
      y: number
    }
    isTransfer: boolean
  }>
  segments: Array<{
    id: string
    fromStationId: string
    toStationId: string
    timeMinutes: number
  }>
  visualToStations: Record<string, Array<string>>
}

export interface VisualStation {
  id: string
  x: number
  y: number
  labelOffset: {
    x: number
    y: number
  }
  isTransfer: boolean
}
