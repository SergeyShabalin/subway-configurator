import type { BadgeEnd, Line, LineType, Point, VisualStation } from '@/types/metro'

export const DEFAULT_BADGE_OFFSET: Point = { x: 0, y: 34 }

export interface ResolvedBadge {
  key: string
  lineId: string
  lineType: LineType
  end: BadgeEnd
  text: string
  color: string
  /** Станция-якорь: значок двигается вместе с ней. */
  anchorId: string
  x: number
  y: number
}

/**
 * Значки привязаны к первой и последней станции линии.
 * Для кольцевой линии и линии из одной станции строится один значок (у первой).
 */
export const resolveBadges = (
  lines: ReadonlyArray<Line>,
  visuals: Record<string, VisualStation>
): Array<ResolvedBadge> => {
  const result: Array<ResolvedBadge> = []

  for (const line of lines) {
    const ids = line.visualStationIds ?? []
    if (!line.lineBadge || ids.length === 0) continue

    const ends: Array<[BadgeEnd, string]> = [['start', ids[0]]]
    if (ids.length > 1 && line.is_circular !== 1) ends.push(['end', ids[ids.length - 1]])

    for (const [end, anchorId] of ends) {
      const anchor = visuals[anchorId]
      if (!anchor) continue

      const offset = line.badgeOffsets?.[end] ?? DEFAULT_BADGE_OFFSET

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
