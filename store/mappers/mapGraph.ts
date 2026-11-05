import type {
  GraphData,
  Line,
  Segment,
  Station,
  VisualStation,
  VisualTransfer,
} from '@/types/metro'

const DEFAULT_LABEL_OFFSET = { x: 0, y: -60 } as const
const DEFAULT_LINE_TYPE: Line['type'] = 'subway'
const DEFAULT_TRANSFER_STYLE: NonNullable<VisualTransfer['style']> = 'dashed'

export interface MappedGraph {
  stations: Array<Station>
  segments: Array<Segment>
  lines: Array<Line>
  visuals: Record<string, VisualStation>
  visualToStations: Record<string, Array<string>>
  visualTransfers: Array<VisualTransfer>
}

export const mapGraph = (data: GraphData): MappedGraph => {
  const stations: Array<Station> = data.stations.map((s) => ({
    id: s.id,
    name: s.name,
    line_id: s.lineId,
  }))

  const segments: Array<Segment> = data.segments.map((s) => ({
    id: s.id,
    from_station_id: s.fromStationId,
    to_station_id: s.toStationId,
    line_id: s.lineId ?? '',
    time_minutes: s.timeMinutes,
  }))

  const lines: Array<Line> = data.lines.map((l) => ({
    id: l.id,
    name: l.name,
    color: l.color,
    is_circular: l.isCircular ? 1 : 0,
    type: l.type ?? DEFAULT_LINE_TYPE,
    visualStationIds: l.visualStationIds,
    logicalStationIds: l.logicalStationIds,
  }))

  const visuals: Record<string, VisualStation> = {}
  for (const v of data.visuals) {
    visuals[v.id] = {
      id: v.id,
      x: v.x,
      y: v.y,
      labelOffset: {
        x: v.labelOffset?.x ?? DEFAULT_LABEL_OFFSET.x,
        y: v.labelOffset?.y ?? DEFAULT_LABEL_OFFSET.y,
      },
      connections: v.connections ?? [],
      displayMode: v.displayMode ?? 'single',
    }
  }

  const visualTransfers: Array<VisualTransfer> = data.visualTransfers.map((t) => ({
    id: t.id,
    from_visual_id: t.fromVisualId,
    to_visual_id: t.toVisualId,
    time_minutes: t.timeMinutes,
    style: (t.style as VisualTransfer['style']) ?? DEFAULT_TRANSFER_STYLE,
  }))

  return {
    stations,
    segments,
    lines,
    visuals,
    visualToStations: data.visualToStations,
    visualTransfers,
  }
}
