import { useMemo } from 'react'

import { useRoute } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { CANVAS_DIMMED_COLOR } from '@/components/canvas/shared/dimmedColors'
import { useTheme } from '@/context/theme-context'
import { useMetroStore } from '@/store'
import type { BadgeEnd } from '@/types/metro'

import Konva from 'konva'
import type { BadgeAppearance, BadgeGeometry } from '../types'
import { createBadgeDragHandler } from '../utils/createBadgeHandlers'
import { resolveBadgeAppearance } from '../utils/resolveBadgeAppearance'
import { resolveBadgeGeometry } from '../utils/resolveBadgeGeometry'
import { resolveBadges } from '../utils/resolveBadges'

interface UseLineBadgesParams {
  onBadgeMove: (lineId: string, end: BadgeEnd, anchorId: string, x: number, y: number) => void
}

export interface LineBadgeViewModel {
  key: string
  x: number
  y: number
  text: string
  geometry: BadgeGeometry
  appearance: BadgeAppearance
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
}
export const useLineBadges = ({ onBadgeMove }: UseLineBadgesParams): LineBadgeViewModel[] => {
  const lines = useMetroStore((state) => state.lines)
  const visuals = useMetroStore((state) => state.visuals)

  const { theme } = useTheme()
  const routeVisualIds = useRoute()?.visualIds

  return useMemo(() => {
    const badges = resolveBadges(lines, visuals)
    const dimmedColor = CANVAS_DIMMED_COLOR[theme]

    return badges.map((badge) => ({
      key: badge.key,
      x: badge.x,
      y: badge.y,
      text: badge.text,

      geometry: resolveBadgeGeometry(badge.text, badge.lineType),

      appearance: resolveBadgeAppearance({
        color: badge.color,
        anchorId: badge.anchorId,
        routeVisualIds,
        dimmedColor,
      }),

      onDragEnd: createBadgeDragHandler({
        onMove: (x, y) => onBadgeMove(badge.lineId, badge.end, badge.anchorId, x, y),
      }),
    }))
  }, [lines, visuals, theme, routeVisualIds, onBadgeMove])
}
