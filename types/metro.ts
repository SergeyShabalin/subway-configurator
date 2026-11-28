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

export interface LineCircle {
  center: Point
  radius: number
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
  circle?: LineCircle
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
  circle?: LineCircle
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

/** Стиль подписей станций. Хранятся только заданные поля, остальное берётся из темы. */
export interface LabelStyle {
  fontSize?: number
  bold?: boolean
  italic?: boolean
  colorLight?: string
  colorDark?: string
}

/**
 * Тип станции для стилей: обычная, с пересадкой (одна линия и пунктир пересадки)
 * или одноимённая (несколько линий в одном узле).
 */
export type StationKind = 'regular' | 'transfer' | 'multiLine'

/** Стиль маркера станции. Нет поля: используется значение по умолчанию. */
export interface StationStyle {
  /** Множитель диаметра (×1 — по умолчанию) */
  sizeScale?: number
  /** Множитель толщины обводки (×1 — по умолчанию) */
  strokeScale?: number
  /** Квадратные маркеры вместо круглых */
  isSquare?: boolean
}

/** Стили станций одной ветки по типам станций. */
export type LineStationStyles = Partial<Record<StationKind, StationStyle>>

/** Стили станций по id ветки. */
export type StationStyles = Record<string, LineStationStyles>

/** Пользовательские стили карты. Нет поля: используются значения по умолчанию. */
export interface MapStyles {
  labels?: LabelStyle
  stations?: StationStyles
  /** Множитель толщины по id линии. Нет записи: толщина по умолчанию (×1). */
  lineWidths?: Record<string, number>
  /** Множитель кривизны по id линии (0 — прямые углы). Нет записи: кривизна по умолчанию (×1). */
  lineCurvature?: Record<string, number>
}

export interface GraphData {
  lines: Array<GraphLine>
  stations: Array<GraphStation>
  visuals: Array<GraphVisual>
  segments: Array<GraphSegment>
  visualToStations: Record<string, Array<string>>
  visualTransfers: Array<GraphTransfer>
  styles?: MapStyles
}

export type InsertPosition = 'start' | 'end'
