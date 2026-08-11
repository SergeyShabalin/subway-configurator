export interface Visual {
  id: string
  x: number
  y: number
  label_x: number
  label_y: number
  is_transfer: number
}

export interface Station {
  id: string
  name: string
  line_id: string
}

export interface Segment {
  id: string
  from_station_id: string
  to_station_id: string
  time_minutes: number
}

export interface Line {
  id: string
  name: string
  color: string
  is_circular: number
}

export interface VisualStationLink {
  visual_id: string
  station_id: string
}

export interface TransformedVisual {
  id: string
  x: number
  y: number
  labelOffset: { x: number; y: number }
  isTransfer: boolean
}

export interface TransformedStation {
  id: string
  name: string
  lineId: string
}

export interface TransformedSegment {
  id: string
  fromStationId: string
  toStationId: string
  timeMinutes: number
}

export interface TransformedLine {
  id: string
  name: string
  color: string
  isCircular: boolean
  visualStationIds: Array<string>
  logicalStationIds: Array<string>
}
