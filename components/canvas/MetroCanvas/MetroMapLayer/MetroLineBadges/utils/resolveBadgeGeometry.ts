import {
  CHAR_WIDTH,
  CIRCLE_RADIUS,
  RAIL_HEIGHT,
  RAIL_MIN_WIDTH,
  RAIL_SKEW,
} from '../LineBadge/constants'
import type { BadgeGeometry } from '../types'

export const resolveBadgeGeometry = (text: string, lineType: string): BadgeGeometry => {
  const isRail = lineType === 'commuter_rail'

  const width = isRail
    ? Math.max(RAIL_MIN_WIDTH, text.length * CHAR_WIDTH + RAIL_SKEW * 2 + 8)
    : CIRCLE_RADIUS * 2

  const height = isRail ? RAIL_HEIGHT : CIRCLE_RADIUS * 2

  return {
    width,
    height,
    fontSize: !isRail && text.length > 2 ? 11 : 14,
    isRail,
  }
}
