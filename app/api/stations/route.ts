import { db } from '@/lib/db'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

interface CreateStationRequest {
  name: string
  lineId: string
  x: number
  y: number
  timeMinutes?: number
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateStationRequest
    const { name, lineId, x, y, timeMinutes } = body

    if (!name || !lineId || x === undefined || y === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const stationId = randomUUID()
    const visualId = randomUUID()
    const labelOffsetY = -40

    // Добавляем станцию
    db.prepare(
      `
        INSERT INTO stations (id, name, line_id)
        VALUES (?, ?, ?)
      `
    ).run(stationId, name, lineId)

    // Добавляем визуал
    db.prepare(
      `
        INSERT INTO visuals (id, x, y, label_x, label_y, is_transfer)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    ).run(visualId, x, y, 0, labelOffsetY, 0)

    // Связываем станцию с визуалом
    db.prepare(
      `
        INSERT INTO visual_station_links (visual_id, station_id)
        VALUES (?, ?)
      `
    ).run(visualId, stationId)

    // Если задано время - создаем сегмент
    if (timeMinutes && timeMinutes > 0) {
      const segmentId = randomUUID()

      // Находим последнюю станцию на этой линии
      const lastStation = db
        .prepare(
          `
            SELECT s.id FROM stations s
            WHERE s.line_id = ?
              AND s.id != ?
            ORDER BY s.id DESC
              LIMIT 1
          `
        )
        .get(lineId, stationId) as { id: string } | undefined

      if (lastStation) {
        db.prepare(
          `
            INSERT INTO segments (id, from_station_id, to_station_id, time_minutes)
            VALUES (?, ?, ?, ?)
          `
        ).run(segmentId, lastStation.id, stationId, timeMinutes)
      }
    }

    return NextResponse.json({
      success: true,
      stationId,
      visualId,
    })
  } catch (error) {
    console.error('Error creating station:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
