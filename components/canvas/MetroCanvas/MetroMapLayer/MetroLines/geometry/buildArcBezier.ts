import type { BezierSegment, Point } from './bezier'

/** Точная дуга окружности кубической кривой Безье: ошибка меньше 0,03% для дуги до 90°. */
export const buildArcBezier = (
  center: Point,
  radius: number,
  startAngle: number,
  delta: number
): BezierSegment => {
  const endAngle = startAngle + delta
  const k = (4 / 3) * Math.tan(delta / 4) * radius

  const at = (a: number): Point => ({
    x: center.x + radius * Math.cos(a),
    y: center.y + radius * Math.sin(a),
  })

  const p0 = at(startAngle)
  const p3 = at(endAngle)

  return {
    p0,
    p1: { x: p0.x - Math.sin(startAngle) * k, y: p0.y + Math.cos(startAngle) * k },
    p2: { x: p3.x + Math.sin(endAngle) * k, y: p3.y - Math.cos(endAngle) * k },
    p3,
  }
}
