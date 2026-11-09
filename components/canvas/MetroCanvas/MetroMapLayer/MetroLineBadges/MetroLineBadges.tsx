'use client'

import type { BadgeEnd } from '@/types/metro'

import { LineBadge } from './LineBadge/LineBadge'
import { useLineBadges } from './hooks/useLineBadges'

interface MetroLineBadgesProps {
  onBadgeMove: (lineId: string, end: BadgeEnd, anchorId: string, x: number, y: number) => void
}

export const MetroLineBadges = ({ onBadgeMove }: MetroLineBadgesProps) => {
  const badges = useLineBadges({ onBadgeMove })

  return (
    <>
      {badges.map((badge) => (
        <LineBadge
          key={badge.key}
          x={badge.x}
          y={badge.y}
          text={badge.text}
          geometry={badge.geometry}
          appearance={badge.appearance}
          onDragEnd={badge.onDragEnd}
        />
      ))}
    </>
  )
}
