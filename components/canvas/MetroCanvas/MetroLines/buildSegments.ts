import { bezierToPath, type BezierSegment, type Point } from './geometry/bezier'
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

export const buildSegments = (
  lineId: string,
  visualIds: Array<string>,
  isCircular: boolean,
  visuals: MetroLinesProps['visuals']
): Array<Segment> => {
  const points = collectPoints(visualIds, isCircular, visuals)
  if (points.length < 2) return []

  const segments: Array<Segment> = []
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const p0 = neighbor(points, i - 1, isCircular, p1)
    const p3 = neighbor(points, i + 2, isCircular, p2)

    const bezier = buildBezier(p0, p1, p2, p3)
    segments.push({
      bezier,
      path: bezierToPath(bezier),
      key: `${lineId}-${p1.id}-${p2.id}`,
      fromId: p1.id,
      toId: p2.id,
    })
  }

  return segments
}
