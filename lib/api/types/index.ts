export interface Visual {
  id: string
  x: number
  y: number
  labelOffset: { x: number; y: number }
  isTransfer: boolean
}

export interface Station {
  id: string
  name: string
  lineId: string
}

export interface Line {
  id: string
  name: string
  color: string
  isCircular: boolean
  visualStationIds: Array<string>
  logicalStationIds: Array<string>
}

export interface Segment {
  id: string
  fromStationId: string
  toStationId: string
  timeMinutes: number
}

export interface GraphData {
  visuals: Array<Visual>
  stations: Array<Station>
  segments: Array<Segment>
  lines: Array<Line>
  visualToStations: Record<string, Array<string>>
}

export interface CreateStationData {
  name: string
  lineId: string
  x: number
  y: number
  timeMinutes?: number
}

export interface CreateLineData {
  name: string
  color: string
}
