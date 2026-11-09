import type { BezierSegment, Point } from './bezier'

const length = (v: Point) => Math.hypot(v.x, v.y)

const normalize = (v: Point): Point => {
  const l = length(v)
  return l === 0 ? { x: 0, y: 0 } : { x: v.x / l, y: v.y / l }
}

/** Поворот касательной на 90° */
const normal = (t: Point): Point => ({ x: -t.y, y: t.x })

/**
 * Смещает кубическую кривую Безье на `offset` по нормали.
 * В углах нормаль усредняется по соседним касательным — так смещённая
 * кривая остаётся гладкой.
 */
export const offsetBezier = (seg: BezierSegment, offset: number): BezierSegment => {
  const { p0, p1, p2, p3 } = seg

  const t0 = normalize({ x: p1.x - p0.x, y: p1.y - p0.y })
  const t1 = normalize({ x: p2.x - p1.x, y: p2.y - p1.y })
  const t2 = normalize({ x: p3.x - p2.x, y: p3.y - p2.y })

  const n0 = normal(t0)
  const n1 = normal(normalize({ x: t0.x + t1.x, y: t0.y + t1.y }))
  const n2 = normal(normalize({ x: t1.x + t2.x, y: t1.y + t2.y }))
  const n3 = normal(t2)

  return {
    p0: { x: p0.x + n0.x * offset, y: p0.y + n0.y * offset },
    p1: { x: p1.x + n1.x * offset, y: p1.y + n1.y * offset },
    p2: { x: p2.x + n2.x * offset, y: p2.y + n2.y * offset },
    p3: { x: p3.x + n3.x * offset, y: p3.y + n3.y * offset },
  }
}
