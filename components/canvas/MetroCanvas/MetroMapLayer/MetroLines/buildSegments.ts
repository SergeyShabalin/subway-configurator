import type { LineCircle } from '@/types/metro'
import { DEFAULT_TENSION } from './constants'
import { bezierToPath, type BezierSegment, type Point } from './geometry/bezier'
import { buildArcBezier } from './geometry/buildArcBezier'
import { buildBezier } from './geometry/buildBezier'
import type { MetroLinesProps } from './types'

export interface Segment {
  bezier: BezierSegment
  path: string
  key: string
  fromId: string
  toId: string
}

interface PointWithId extends Point {
  id: string
}

const MAX_ARC = Math.PI / 2

const collectPoints = (
  visualIds: Array<string>,
  isCircular: boolean,
  visuals: MetroLinesProps['visuals']
): Array<PointWithId> => {
  const orderedIds = [...visualIds]
  if (isCircular && orderedIds.length > 0) orderedIds.push(orderedIds[0])

  const points: Array<PointWithId> = []
  for (const visualId of orderedIds) {
    const visual = visuals[visualId]
    if (!visual) continue
    points.push({ id: visualId, x: visual.x, y: visual.y })
  }
  return points
}

const neighbor = (
  points: Array<PointWithId>,
  index: number,
  isCircular: boolean,
  fallback: PointWithId
): PointWithId => {
  const candidate = points[index]
  if (candidate) return candidate
  if (!isCircular) return fallback
  return points[(index + points.length) % points.length]
}

/** Кратчайшая дуга между углами, в (-π, π] */
const shortestDelta = (from: number, to: number): number => {
  let delta = to - from
  while (delta > Math.PI) delta -= 2 * Math.PI
  while (delta <= -Math.PI) delta += 2 * Math.PI
  return delta
}

const buildArcPath = (circle: LineCircle, p1: Point, p2: Point): Array<BezierSegment> => {
  const a1 = Math.atan2(p1.y - circle.center.y, p1.x - circle.center.x)
  const a2 = Math.atan2(p2.y - circle.center.y, p2.x - circle.center.x)
  const delta = shortestDelta(a1, a2)
  const parts = Math.max(1, Math.ceil(Math.abs(delta) / MAX_ARC))

  return Array.from({ length: parts }, (_, i) =>
    buildArcBezier(circle.center, circle.radius, a1 + (delta / parts) * i, delta / parts)
  )
}

/**
 * @param curvature множитель натяжения относительно DEFAULT_TENSION: 0 даёт прямые углы,
 * 1 — вид по умолчанию. Для линий-окружностей (`circle`) не применяется.
 */
export const buildSegments = (
  lineId: string,
  visualIds: Array<string>,
  isCircular: boolean,
  visuals: MetroLinesProps['visuals'],
  circle?: LineCircle,
  curvature = 1
): Array<Segment> => {
  const points = collectPoints(visualIds, isCircular, visuals)
  if (points.length < 2) return []

  const tension = DEFAULT_TENSION * curvature

  const segments: Array<Segment> = []
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const key = `${lineId}-${p1.id}-${p2.id}`

    if (circle) {
      const arcs = buildArcPath(circle, p1, p2)
      segments.push({
        bezier: arcs[0],
        path: arcs.map(bezierToPath).join(' '),
        key,
        fromId: p1.id,
        toId: p2.id,
      })
      continue
    }

    const p0 = neighbor(points, i - 1, isCircular, p1)
    const p3 = neighbor(points, i + 2, isCircular, p2)

    const bezier = buildBezier(p0, p1, p2, p3, tension)
    segments.push({ bezier, path: bezierToPath(bezier), key, fromId: p1.id, toId: p2.id })
  }

  return segments
}
