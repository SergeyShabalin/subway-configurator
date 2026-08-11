import { db } from '@/lib/db'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

interface CreateLineRequest {
  name: string
  color?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateLineRequest
    const { name, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const id = randomUUID()
    const lineColor = color || '#3b82f6'

    const stmt = db.prepare(`
      INSERT INTO lines (id, name, color, is_circular)
      VALUES (?, ?, ?, ?)
    `)

    stmt.run(id, name, lineColor, 0)

    return NextResponse.json({
      success: true,
      lineId: id,
      name,
      color: lineColor,
    })
  } catch (error) {
    console.error('Error creating line:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
