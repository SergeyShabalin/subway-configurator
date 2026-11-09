import type { BadgeAppearance } from '../types'
import { resolveBadgeTextColor } from './resolveBadgeColors'

interface ResolveBadgeAppearanceParams {
  color: string
  anchorId: string
  routeVisualIds?: Set<string>
  dimmedColor: string
}

export const resolveBadgeAppearance = ({
  color,
  anchorId,
  routeVisualIds,
  dimmedColor,
}: ResolveBadgeAppearanceParams): BadgeAppearance => {
  const isDimmed = routeVisualIds ? !routeVisualIds.has(anchorId) : false

  return {
    isDimmed,
    fill: isDimmed ? dimmedColor : color,
    textColor: isDimmed ? '#151414' : resolveBadgeTextColor(color),
  }
}
