import metroData from '@/scripts/metro.json'
import {
  segmentsRepo,
  stationsRepo,
  visualsRepo,
  visualStationLinksRepo,
} from '@/src/lib/indexeddb/repositories'
import type { Segment, Station, Visual, VisualStationLink } from '@/types/metro'
import { linesRepo } from '../repositories/lines.repository'

interface MetroJsonLine {
  id: string | number
  name: string
  color: string
  isCircular?: boolean
  visualStationIds?: Array<string>
  logicalStationIds?: Array<string>
}

interface MetroJsonStation {
  id: string | number
  name: string
}

interface MetroJsonVisual {
  id: string | number
  x: number
  y: number
  labelOffset?: { x: number; y: number }
  connections: Array<string>
}

interface MetroJsonSegment {
  id: string | number
  fromStationId: string
  toStationId: string
  timeMinutes: number
}

interface MetroJson {
  lines: Record<string, MetroJsonLine>
  logic: {
    stations: Record<string, MetroJsonStation>
    segments: Record<string, MetroJsonSegment>
  }
  visuals: {
    stations: Record<string, MetroJsonVisual>
  }
}

interface LineRecord {
  id: string
  name: string
  color: string
  is_circular: number
  visualStationIds: Array<string>
  logicalStationIds: Array<string>
}

const data = metroData as unknown as MetroJson

export async function importMetroData() {
  console.log('Starting migration to IndexedDB...')

  try {
    const lines: Array<LineRecord> = Object.values(data.lines).map((line) => ({
      id: String(line.id),
      name: line.name,
      color: line.color,
      is_circular: line.isCircular ? 1 : 0,
      visualStationIds: line.visualStationIds ?? [],
      logicalStationIds: line.logicalStationIds ?? [],
    }))

    console.log(
      'Lines to import:',
      lines.map((l) => ({
        id: l.id,
        name: l.name,
        visualStationIds: l.visualStationIds.length,
        logicalStationIds: l.logicalStationIds.length,
      }))
    )

    await linesRepo.clear()
    await linesRepo.saveMany(lines)
    console.log(`Imported ${lines.length} lines with visualStationIds`)

    const logicStations = Object.values(data.logic.stations)
    const stations: Array<Station> = []
    const linesArray = Object.values(data.lines)
    let skipped = 0

    for (const station of logicStations) {
      const line = linesArray.find((l) => l.logicalStationIds?.includes(String(station.id)))

      if (line) {
        stations.push({
          id: String(station.id),
          name: station.name,
          line_id: String(line.id),
        })
      } else {
        skipped++
        console.warn(`Station ${station.id} (${station.name}) skipped — no line found`)
      }
    }

    await stationsRepo.clear()
    await stationsRepo.saveMany(stations)
    console.log(`Imported ${stations.length} stations (${skipped} skipped)`)

    const visualsData = Object.values(data.visuals.stations)
    const visuals: Array<Visual> = visualsData.map((v) => ({
      id: String(v.id),
      x: v.x,
      y: v.y,
      label_x: v.labelOffset?.x ?? 0,
      label_y: v.labelOffset?.y ?? -60,
      is_transfer: v.connections.length > 1 ? 1 : 0,
    }))

    await visualsRepo.clear()
    await visualsRepo.saveMany(visuals)
    console.log(`Imported ${visuals.length} visuals`)

    const links: Array<VisualStationLink> = []
    for (const [visualId, visual] of Object.entries(data.visuals.stations)) {
      for (const stationId of visual.connections) {
        links.push({
          id: `${visualId}:${stationId}`,
          visual_id: String(visualId),
          station_id: String(stationId),
        })
      }
    }

    await visualStationLinksRepo.clear()
    await visualStationLinksRepo.saveMany(links)
    console.log(`Imported ${links.length} visual-station links`)

    const segmentsData = Object.values(data.logic.segments)
    const segments: Array<Segment> = segmentsData.map((s) => ({
      id: String(s.id),
      from_station_id: String(s.fromStationId),
      to_station_id: String(s.toStationId),
      time_minutes: s.timeMinutes,
    }))

    await segmentsRepo.clear()
    await segmentsRepo.saveMany(segments)
    console.log(`Imported ${segments.length} segments`)

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
