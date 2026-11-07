'use client'

import { useRoute } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { CANVAS_DIMMED_COLOR } from '@/components/canvas/shared/dimmedColors'
import { useTheme } from '@/context/theme-context'
import { useMetroStore } from '@/store'
import type { BadgeEnd } from '@/types/metro'
import { useMemo } from 'react'
import { LineBadge } from './LineBadge'
import { resolveBadges } from './resolveBadges'

interface MetroLineBadgesProps {
  onBadgeMove: (lineId: string, end: BadgeEnd, anchorId: string, x: number, y: number) => void
}

export const MetroLineBadges = ({ onBadgeMove }: MetroLineBadgesProps) => {
  const { theme } = useTheme()
  const lines = useMetroStore((state) => state.lines)
  const visuals = useMetroStore((state) => state.visuals)
  const routeVisualIds = useRoute()?.visualIds

  const badges = useMemo(() => resolveBadges(lines, visuals), [lines, visuals])
  const dimmedColor = CANVAS_DIMMED_COLOR[theme]

  return (
    <>
      {badges.map((badge) => {
        const isDimmed = routeVisualIds ? !routeVisualIds.has(badge.anchorId) : false

        return (
          <LineBadge
            key={badge.key}
            x={badge.x}
            y={badge.y}
            text={badge.text}
            lineType={badge.lineType}
            color={badge.color}
            fill={isDimmed ? dimmedColor : badge.color}
            isDimmed={isDimmed}
            onDragEnd={(x, y) => onBadgeMove(badge.lineId, badge.end, badge.anchorId, x, y)}
          />
        )
      })}
    </>
  )
}
