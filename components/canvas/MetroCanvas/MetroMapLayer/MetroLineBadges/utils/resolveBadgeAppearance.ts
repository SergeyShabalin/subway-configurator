import type { BadgeAppearance } from '../types'
import { resolveBadgeTextColor } from './resolveBadgeColors'

interface ResolveBadgeAppearanceParams {
  color: string
  anchorId: string
  routeVisualIds?: Set<string>
  dimmedColor: string
  dimmedTextColor: string
}

export const resolveBadgeAppearance = ({
  color,
  anchorId,
  routeVisualIds,
  dimmedColor,
  dimmedTextColor,
}: ResolveBadgeAppearanceParams): BadgeAppearance => {
  const isDimmed = routeVisualIds ? !routeVisualIds.has(anchorId) : false

  return {
    isDimmed,
    fill: isDimmed ? dimmedColor : color,
    textColor: isDimmed ? dimmedTextColor : resolveBadgeTextColor(color),
  }
}
