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

export interface Station {
  id: string
  name: string
  lineId: number
}

export interface Segment {
  id: string
  fromStationId: string
  toStationId: string
  timeMinutes: number
}

export interface Line {
  id: string
  name: string
  color: string
  isCircular: boolean
  visualStationIds: Array<string>
  logicalStationIds: Array<string>
}
