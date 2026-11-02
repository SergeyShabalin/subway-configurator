export interface Point {
  x: number
  y: number
}

export interface BezierSegment {
  p0: Point
  p1: Point
  p2: Point
  p3: Point
}

export const bezierToPath = (seg: BezierSegment): string =>
  `M ${seg.p0.x} ${seg.p0.y} C ${seg.p1.x} ${seg.p1.y}, ${seg.p2.x} ${seg.p2.y}, ${seg.p3.x} ${seg.p3.y}`
