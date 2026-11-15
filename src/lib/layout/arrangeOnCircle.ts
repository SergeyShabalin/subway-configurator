import type { PositionedVisual } from './alignStations'

interface Point {
  x: number
  y: number
}

const MIN_STATIONS = 3

export const getCentroid = (visuals: ReadonlyArray<Point>): Point => ({
  x: visuals.reduce((sum, v) => sum + v.x, 0) / visuals.length,
  y: visuals.reduce((sum, v) => sum + v.y, 0) / visuals.length,
})

export const getMeanDistance = (visuals: ReadonlyArray<Point>, center: Point): number =>
  visuals.reduce((sum, v) => sum + Math.hypot(v.x - center.x, v.y - center.y), 0) / visuals.length

/** +1 или -1: направление обхода исходного многоугольника */
const getWindingSign = (visuals: ReadonlyArray<Point>): 1 | -1 => {
  let area = 0
  visuals.forEach((a, i) => {
    const b = visuals[(i + 1) % visuals.length]
    area += a.x * b.y - b.x * a.y
  })
  return area >= 0 ? 1 : -1
}

/** Равномерно расставляет станции по окружности, сохраняя порядок и направление обхода */
export const arrangeOnCircle = (
  visuals: ReadonlyArray<PositionedVisual>,
  center: Point,
  radius: number
): Array<PositionedVisual> => {
  if (visuals.length < MIN_STATIONS || radius <= 0) return []

  const step = ((2 * Math.PI) / visuals.length) * getWindingSign(visuals)
  const startAngle = Math.atan2(visuals[0].y - center.y, visuals[0].x - center.x)

  return visuals.map((visual, index) => ({
    id: visual.id,
    x: center.x + radius * Math.cos(startAngle + step * index),
    y: center.y + radius * Math.sin(startAngle + step * index),
  }))
}
