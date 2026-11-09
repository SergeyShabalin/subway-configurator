'use client'

import { useRoute } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { CANVAS_DIMMED_COLOR } from '@/components/canvas/shared/dimmedColors'
import { CANVAS_HOVER_COLOR } from '@/components/canvas/shared/themeColors'
import { useTheme } from '@/context/theme-context'
import type { LineType } from '@/types/metro'
import { memo, useMemo } from 'react'
import { buildSegments, type Segment } from './buildSegments'
import { useMetroLines } from './hooks/useMetroLines'
import { SegmentPath } from './SegmentPath'
import type { MetroLinesProps } from './types'

interface SegmentItem {
  segment: Segment
  lineId: string
  lineType: LineType
  color: string
  isDimmed: boolean
  lineBadge?: string
}

const byType = (a: SegmentItem, b: SegmentItem) =>
  Number(a.lineType === 'commuter_rail') - Number(b.lineType === 'commuter_rail')

const useSegmentItems = (
  visuals: MetroLinesProps['visuals'],
  routeKeys: Set<string> | undefined
): Array<SegmentItem> => {
  const { lineData } = useMetroLines()
  return useMemo(() => {
    const items: Array<SegmentItem> = []

    for (const line of lineData) {
      const segments = buildSegments(line.id, line.visualStationIds, line.isCircular, visuals)
      for (const segment of segments) {
        items.push({
          segment,
          lineId: String(line.id),
          lineType: line.type ?? 'subway',
          color: line.color,
          lineBadge: line.lineBadge,
          isDimmed: routeKeys ? !routeKeys.has(segment.key) : false,
        })
      }
    }

    items.sort(byType)

    if (routeKeys) {
      const dimmed = items.filter((i) => i.isDimmed).sort(byType)
      const active = items.filter((i) => !i.isDimmed).sort(byType)
      return [...dimmed, ...active]
    }

    return items
  }, [lineData, visuals, routeKeys])
}

export const MetroLines = memo(({ visuals, lineRef, onSegmentClick }: MetroLinesProps) => {
  const { theme } = useTheme()
  const route = useRoute()
  const dimmedColor = CANVAS_DIMMED_COLOR[theme]
  const hoverColor = CANVAS_HOVER_COLOR[theme]

  const items = useSegmentItems(visuals, route?.segmentKeys)
  return (
    <>
      {items.map(({ segment, lineId, lineType, color, isDimmed }) => (
        <SegmentPath
          key={segment.key}
          segment={segment}
          lineId={lineId}
          lineType={lineType}
          color={isDimmed ? dimmedColor : color}
          hoverColor={hoverColor}
          isDimmed={isDimmed}
          lineRef={lineRef}
          onSegmentClick={onSegmentClick}
        />
      ))}
    </>
  )
})

MetroLines.displayName = 'MetroLines'
