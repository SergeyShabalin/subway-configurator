import { CONTROL_POINT_DIVISOR, DEFAULT_TENSION, TENSION_MULTIPLIER } from '../constants'
import type { BezierSegment, Point } from './bezier'

/**
 * Строит кубическую кривую Безье через 4 опорные точки (Catmull-Rom-подобная).
 * p1 и p2 — реальные концы сегмента, p0 и p3 — соседи для плавности.
 */
export const buildBezier = (
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  tension = DEFAULT_TENSION
): BezierSegment => {
  const cp1x = p1.x + ((p2.x - p0.x) / CONTROL_POINT_DIVISOR) * tension * TENSION_MULTIPLIER
  const cp1y = p1.y + ((p2.y - p0.y) / CONTROL_POINT_DIVISOR) * tension * TENSION_MULTIPLIER
  const cp2x = p2.x - ((p3.x - p1.x) / CONTROL_POINT_DIVISOR) * tension * TENSION_MULTIPLIER
  const cp2y = p2.y - ((p3.y - p1.y) / CONTROL_POINT_DIVISOR) * tension * TENSION_MULTIPLIER

  return {
    p0: p1,
    p1: { x: cp1x, y: cp1y },
    p2: { x: cp2x, y: cp2y },
    p3: p2,
  }
}
