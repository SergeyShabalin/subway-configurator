import { Visual } from '@/app/api/graph/types'
import { UpdateVisualRequest } from '@/app/api/visuals/[id]/types'
import db from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = (await req.json()) as UpdateVisualRequest
    const { x, y } = body

    // Проверяем наличие полей
    if (x === undefined || y === undefined) {
      return NextResponse.json({ error: 'x and y are required' }, { status: 400 })
    }

    const stmt = db.prepare(`
        UPDATE visuals SET x = ?, y = ? WHERE id = ?
    `)

    const result = stmt.run(x, y, id)

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Visual station not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating visual position:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const stmt = db.prepare(`
        SELECT * FROM visuals WHERE id = ?
    `)

    const visual = stmt.get(id) as Visual | undefined

    if (!visual) {
      return NextResponse.json({ error: 'Visual station not found' }, { status: 404 })
    }

    return NextResponse.json(visual)
  } catch (error) {
    console.error('Error fetching visual:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
