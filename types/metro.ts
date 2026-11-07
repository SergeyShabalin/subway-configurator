export interface Visual {
  id: string
  x: number
  y: number
  labelOffset: {
    x: number
    y: number
  }
}

export interface VisualStation {
  id: string
  x: number
  y: number
  labelOffset: {
    x: number
    y: number
  }
  connections: Array<string>
  displayMode: 'single' | 'multiple'
}

export interface Station {
  id: string
  name: string
  line_id: string
  createdAt?: number
}

export interface Segment {
  id: string
  from_station_id: string
  to_station_id: string
  line_id: string
  time_minutes: number
}

export type LineType = 'subway' | 'commuter_rail'

export interface Point {
  x: number
  y: number
}

export type BadgeEnd = 'start' | 'end'

/** Смещение значка относительно крайней станции. Нет записи: используется значение по умолчанию. */
export type LineBadgeOffsets = Partial<Record<BadgeEnd, Point>>

export interface Line {
  id: string
  name: string
  color: string
  is_circular: number
  visualStationIds: Array<string>
  logicalStationIds: Array<string>
  type: LineType
  lineBadge?: string
  badgeOffsets?: LineBadgeOffsets
}

export interface VisualTransfer {
  id: string
  from_visual_id: string
  to_visual_id: string
  time_minutes: number
  style?: 'dashed' | 'solid' | 'dotted'
}

export interface VisualStationLink {
  id: string
  visual_id: string
  station_id: string
}

export interface VisualToLogical {
  [visualId: string]: Array<string>
}

export interface GraphLine {
  id: string
  name: string
  color: string
  isCircular: boolean
  visualStationIds: Array<string>
  logicalStationIds: Array<string>
  type: LineType
  lineBadge?: string
  badgeOffsets?: LineBadgeOffsets
}

export interface GraphStation {
  id: string
  name: string
  lineId: string
}

export interface GraphVisual {
  id: string
  x: number
  y: number
  labelOffset: {
    x: number
    y: number
  }
  connections: Array<string>
  displayMode: 'single' | 'multiple'
}

export interface GraphSegment {
  id: string
  fromStationId: string
  toStationId: string
  lineId: string
  timeMinutes: number
}

export interface GraphTransfer {
  id: string
  fromVisualId: string
  toVisualId: string
  timeMinutes: number
  style?: string
}

export interface GraphData {
  lines: Array<GraphLine>
  stations: Array<GraphStation>
  visuals: Array<GraphVisual>
  segments: Array<GraphSegment>
  visualToStations: Record<string, Array<string>>
  visualTransfers: Array<GraphTransfer>
}

export type InsertPosition = 'start' | 'end'
