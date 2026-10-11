import {
  linesRepo,
  segmentsRepo,
  stationsRepo,
  visualsRepo,
  visualStationLinksRepo,
  visualTransfersRepo,
} from '@/src/lib/indexeddb/repositories'
import type { GraphData } from '@/types/metro'

export const graphService = {
  async getGraph(): Promise<GraphData> {
    const [lines, stations, visuals, links, segments, transfers] = await Promise.all([
      linesRepo.getAll(),
      stationsRepo.getAll(),
      visualsRepo.getAll(),
      visualStationLinksRepo.getAll(),
      segmentsRepo.getAll(),
      visualTransfersRepo.getAll(),
    ])

    const visualToStations: Record<string, Array<string>> = {}
    for (const link of links) {
      if (!visualToStations[link.visual_id]) {
        visualToStations[link.visual_id] = []
      }
      visualToStations[link.visual_id].push(link.station_id)
    }

    return {
      lines: lines.map((l) => ({
        id: l.id,
        name: l.name,
        color: l.color,
        isCircular: Boolean(l.is_circular),
        visualStationIds: l.visualStationIds || [],
        logicalStationIds: l.logicalStationIds || [],
      })),
      stations: stations.map((s) => ({
        id: s.id,
        name: s.name,
        lineId: s.line_id,
      })),
      visuals: visuals.map((v) => ({
        id: v.id,
        x: v.x,
        y: v.y,
        labelOffset: {
          x: v.label_x || 0,
          y: v.label_y || -60,
        },
        isTransfer: Boolean(v.is_transfer),
      })),
      segments: segments.map((s) => ({
        id: s.id,
        fromStationId: s.from_station_id,
        toStationId: s.to_station_id,
        timeMinutes: s.time_minutes,
      })),
      visualToStations,
      visualTransfers: transfers.map((t) => ({
        id: t.id,
        fromVisualId: t.from_visual_id,
        toVisualId: t.to_visual_id,
        timeMinutes: t.time_minutes,
        style: t.style,
      })),
    }
  },
}
