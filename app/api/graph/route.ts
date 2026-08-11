import {
  Line,
  Segment,
  Station,
  TransformedLine,
  TransformedSegment,
  TransformedStation,
  TransformedVisual,
  Visual,
  VisualStationLink,
} from '@/app/api/graph/types'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  // 1. Получаем сырые данные с явным указанием типа
  const rawVisuals = db.prepare('SELECT * FROM visuals').all() as Array<Visual>
  const rawStations = db.prepare('SELECT * FROM stations').all() as Array<Station>
  const rawSegments = db.prepare('SELECT * FROM segments').all() as Array<Segment>
  const rawLines = db.prepare('SELECT * FROM lines').all() as Array<Line>
  const rawLinks = db
    .prepare('SELECT * FROM visual_station_links')
    .all() as Array<VisualStationLink>

  // 2. Трансформируем визуалы
  const visuals: Array<TransformedVisual> = rawVisuals.map((v) => ({
    id: v.id,
    x: v.x,
    y: v.y,
    labelOffset: { x: v.label_x, y: v.label_y },
    isTransfer: Boolean(v.is_transfer),
  }))

  // 3. Строим связи visual → station
  const visualToStations: Record<string, Array<string>> = {}
  for (const link of rawLinks) {
    if (!visualToStations[link.visual_id]) {
      visualToStations[link.visual_id] = []
    }
    visualToStations[link.visual_id].push(link.station_id)
  }

  // 4. Строим связи visual → station (обратная)
  const stationToVisuals: Record<string, Array<string>> = {}
  for (const link of rawLinks) {
    if (!stationToVisuals[link.station_id]) {
      stationToVisuals[link.station_id] = []
    }
    stationToVisuals[link.station_id].push(link.visual_id)
  }

  // 5. Трансформируем линии с visualStationIds
  const lines: Array<TransformedLine> = rawLines.map((l) => {
    // Находим логические станции для этой линии
    const lineStations = rawStations.filter((s) => s.line_id === l.id)

    // Для каждой логической станции находим визуальные
    const visualIds: Array<string> = []
    for (const station of lineStations) {
      const visIds = stationToVisuals[station.id] || []
      for (const visId of visIds) {
        if (!visualIds.includes(visId)) {
          visualIds.push(visId)
        }
      }
    }

    return {
      id: l.id,
      name: l.name,
      color: l.color,
      isCircular: Boolean(l.is_circular),
      visualStationIds: visualIds,
      logicalStationIds: lineStations.map((s) => s.id),
    }
  })

  // 6. Трансформируем станции
  const stations: Array<TransformedStation> = rawStations.map((s) => ({
    id: s.id,
    name: s.name,
    lineId: s.line_id,
  }))

  // 7. Трансформируем сегменты
  const segments: Array<TransformedSegment> = rawSegments.map((s) => ({
    id: s.id,
    fromStationId: s.from_station_id,
    toStationId: s.to_station_id,
    timeMinutes: s.time_minutes,
  }))

  // 8. Возвращаем готовые данные
  return NextResponse.json({
    visuals,
    stations,
    segments,
    lines,
    visualToStations,
  })
}
