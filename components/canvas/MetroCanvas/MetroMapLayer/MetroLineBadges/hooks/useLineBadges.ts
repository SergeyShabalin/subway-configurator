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

const NO_VISUAL_IDS = new Set<string>()

export const useLineBadges = ({ onBadgeMove }: UseLineBadgesParams): Array<LineBadgeViewModel> => {
  const lines = useMetroStore((state) => state.lines)
  const visuals = useMetroStore((state) => state.visuals)
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const { theme } = useTheme()
  const route = useRoute()
  const routeVisualIds = route?.visualIds

  // Станции, которые маршрут реально использует
  const routeStationIds = useMemo(() => {
    if (!route) return null

    const ids = new Set<string>()
    for (const leg of route.legs) leg.stationIds.forEach((id) => ids.add(String(id)))
    for (const access of [route.startAccess, route.endAccess]) {
      if (!access) continue
      ids.add(String(access.fromStationId))
      ids.add(String(access.toStationId))
    }
    return ids
  }, [route])

  return useMemo(() => {
    const badges = resolveBadges(lines, visuals)
    const dimmedColor = CANVAS_DIMMED_COLOR[theme]

    const lineStations = new Map(
      lines.map((line) => [String(line.id), new Set((line.logicalStationIds ?? []).map(String))])
    )

    // Станция этой линии на узле бейджа участвует в маршруте
    const isLineUsedAtAnchor = (lineId: string, anchorId: string) => {
      if (!routeStationIds) return true

      const ownStations = lineStations.get(String(lineId))
      if (!ownStations) return true

      return (visualToStations[anchorId] ?? []).some(
        (stationId) => ownStations.has(String(stationId)) && routeStationIds.has(String(stationId))
      )
    }

    return badges.map((badge) => ({
      key: badge.key,
      x: badge.x,
      y: badge.y,
      text: badge.text,

      geometry: resolveBadgeGeometry(badge.text, badge.lineType),

      appearance: resolveBadgeAppearance({
        color: badge.color,
        anchorId: badge.anchorId,
        routeVisualIds: isLineUsedAtAnchor(badge.lineId, badge.anchorId)
          ? routeVisualIds
          : NO_VISUAL_IDS,
        dimmedColor,
      }),

      onDragEnd: createBadgeDragHandler({
        onMove: (x, y) => onBadgeMove(badge.lineId, badge.end, badge.anchorId, x, y),
      }),
    }))
  }, [lines, visuals, visualToStations, theme, routeVisualIds, routeStationIds, onBadgeMove])
}
