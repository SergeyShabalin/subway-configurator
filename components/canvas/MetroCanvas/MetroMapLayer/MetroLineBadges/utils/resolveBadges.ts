import type { Line, Point, VisualStation } from '@/types/metro'
import { DEFAULT_BADGE_OFFSET } from '../LineBadge/constants'
import type { ResolvedBadge } from '../types'

export const resolveBadges = (
  lines: ReadonlyArray<Line>,
  visuals: Record<string, VisualStation>
): Array<ResolvedBadge> => {
  const result: Array<ResolvedBadge> = []

  for (const line of lines) {
    const ids = line.visualStationIds ?? []

    if (!line.lineBadge || ids.length === 0) continue

    const ends: Array<['start' | 'end', string]> = [['start', ids[0]]]

    if (ids.length > 1 && line.is_circular !== 1) {
      ends.push(['end', ids[ids.length - 1]])
    }

    for (const [end, anchorId] of ends) {
      const anchor = visuals[anchorId]

      if (!anchor) continue

      const offset: Point = line.badgeOffsets?.[end] ?? DEFAULT_BADGE_OFFSET

      result.push({
        key: `${line.id}:${end}`,
        lineId: line.id,
        lineType: line.type ?? 'subway',
        end,
        text: line.lineBadge,
        color: line.color,
        anchorId,
        x: anchor.x + offset.x,
        y: anchor.y + offset.y,
      })
    }
  }

  return result
}
