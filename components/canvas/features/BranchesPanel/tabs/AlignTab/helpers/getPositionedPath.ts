import type { PositionedVisual } from '@/src/lib/layout/alignStations'
import type { VisualStation } from '@/types/metro'

/** Координаты станций пути. null, если хотя бы одной нет в сторе */
export const getPositionedPath = (
  path: ReadonlyArray<string>,
  visuals: Readonly<Record<string, VisualStation | undefined>>
): Array<PositionedVisual> | null => {
  const positioned: Array<PositionedVisual> = []

  for (const id of path) {
    const visual = visuals[id]
    if (!visual) return null
    positioned.push({ id: visual.id, x: visual.x, y: visual.y })
  }

  return positioned
}
