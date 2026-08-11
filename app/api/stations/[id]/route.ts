import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Проверяем, существует ли станция
    const station = db.prepare('SELECT * FROM stations WHERE id = ?').get(id)
    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 })
    }

    // Начинаем транзакцию
    const transaction = db.transaction(() => {
      // Удаляем связи visual_station_links
      db.prepare(
        `
        DELETE FROM visual_station_links 
        WHERE station_id = ?
      `
      ).run(id)

      // Находим visual_id для этой станции
      const link = db
        .prepare(
          `
        SELECT visual_id FROM visual_station_links 
        WHERE station_id = ?
      `
        )
        .get(id) as { visual_id: string } | undefined

      // Удаляем visual
      if (link) {
        db.prepare(
          `
          DELETE FROM visuals WHERE id = ?
        `
        ).run(link.visual_id)
      }

      // Удаляем сегменты связанные со станцией
      db.prepare(
        `
        DELETE FROM segments 
        WHERE from_station_id = ? OR to_station_id = ?
      `
      ).run(id, id)

      // Удаляем станцию
      db.prepare(
        `
        DELETE FROM stations WHERE id = ?
      `
      ).run(id)
    })

    transaction()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting station:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
