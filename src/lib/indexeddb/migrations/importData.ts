import metroData from '@/scripts/metro.json'
import type { Segment, Station, Visual, VisualStationLink } from '@/types/metro'
import { linesRepo } from '../repositories/lines.repository'
import { segmentsRepo } from '../repositories/segments.repository'
import { stationsRepo } from '../repositories/stations.repository'
import { visualStationLinksRepo } from '../repositories/visual-station-links.repository'
import { visualsRepo } from '../repositories/visuals.repository'

export async function importMetroData() {
  console.log('🚀 Starting migration to IndexedDB...')

  try {
    // 1. Импорт линий с visualStationIds и logicalStationIds
    const lines: Array<any> = Object.values(metroData.lines).map((line: any) => ({
      id: String(line.id),
      name: line.name,
      color: line.color,
      is_circular: line.isCircular ? 1 : 0,
      visualStationIds: line.visualStationIds || [], // 👈 Сохраняем
      logicalStationIds: line.logicalStationIds || [], // 👈 Сохраняем
    }))

    console.log(
      '📊 Lines to import:',
      lines.map((l) => ({
        id: l.id,
        name: l.name,
        visualStationIds: l.visualStationIds.length,
        logicalStationIds: l.logicalStationIds.length,
      }))
    )

    await linesRepo.clear()
    await linesRepo.saveMany(lines)
    console.log(`✅ Imported ${lines.length} lines with visualStationIds`)

    // 2. Импорт станций (оставляем как есть)
    const logicStations = Object.values(metroData.logic.stations) as any[]
    const stations: Station[] = []
    let skipped = 0

    for (const station of logicStations) {
      let lineId: string | null = null
      for (const line of Object.values(metroData.lines) as any[]) {
        if (line.logicalStationIds.includes(station.id)) {
          lineId = String(line.id)
          break
        }
      }

      if (lineId) {
        stations.push({
          id: String(station.id),
          name: station.name,
          line_id: lineId,
        })
      } else {
        skipped++
        console.warn(`⚠️ Station ${station.id} (${station.name}) skipped - no line found`)
      }
    }

    await stationsRepo.clear()
    await stationsRepo.saveMany(stations)
    console.log(`✅ Imported ${stations.length} stations (${skipped} skipped)`)

    // 3. Импорт визуальных элементов
    const visualsData = Object.values(metroData.visuals.stations) as any[]
    const visuals: Visual[] = visualsData.map((v) => ({
      id: String(v.id),
      x: v.x,
      y: v.y,
      label_x: v.labelOffset?.x || 0,
      label_y: v.labelOffset?.y || -60,
      is_transfer: v.connections.length > 1 ? 1 : 0,
    }))

    await visualsRepo.clear()
    await visualsRepo.saveMany(visuals)
    console.log(`✅ Imported ${visuals.length} visuals`)

    // 4. Импорт связей visual-station
    const links: VisualStationLink[] = []
    for (const [visualId, visual] of Object.entries(metroData.visuals.stations) as [
      string,
      any,
    ][]) {
      for (const stationId of visual.connections) {
        links.push({
          visual_id: String(visualId),
          station_id: String(stationId),
        })
      }
    }

    await visualStationLinksRepo.clear()
    await visualStationLinksRepo.saveMany(links)
    console.log(`✅ Imported ${links.length} visual-station links`)

    // 5. Импорт сегментов
    const segmentsData = Object.values(metroData.logic.segments) as any[]
    const segments: Segment[] = segmentsData.map((s) => ({
      id: String(s.id),
      from_station_id: String(s.fromStationId),
      to_station_id: String(s.toStationId),
      time_minutes: s.timeMinutes,
    }))

    await segmentsRepo.clear()
    await segmentsRepo.saveMany(segments)
    console.log(`✅ Imported ${segments.length} segments`)

    console.log('🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}
