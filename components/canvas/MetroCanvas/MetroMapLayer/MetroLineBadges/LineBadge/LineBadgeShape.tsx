import { Circle, Line } from 'react-konva'

import type { BadgeGeometry } from '../types'
import { CIRCLE_RADIUS, RAIL_SKEW } from './constants'

interface LineBadgeShapeProps {
  geometry: BadgeGeometry
  fill: string
}

export const LineBadgeShape = ({ geometry, fill }: LineBadgeShapeProps) => {
  if (!geometry.isRail) {
    return <Circle radius={CIRCLE_RADIUS} fill={fill} perfectDrawEnabled={false} />
  }

  const { width, height } = geometry

  return (
    <Line
      closed
      points={[
        -width / 2 + RAIL_SKEW,
        -height / 2,
        width / 2,
        -height / 2,
        width / 2 - RAIL_SKEW,
        height / 2,
        -width / 2,
        height / 2,
      ]}
      fill={fill}
      lineJoin="round"
      perfectDrawEnabled={false}
    />
  )
}
