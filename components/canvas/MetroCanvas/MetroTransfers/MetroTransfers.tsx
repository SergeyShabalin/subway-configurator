'use client'

import { useRoute } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { CANVAS_DIMMED_COLOR } from '@/components/canvas/shared/dimmedColors'
import { CANVAS_HOVER_COLOR, CANVAS_TRANSFER_OUTLINE } from '@/components/canvas/shared/themeColors'
import { useTheme } from '@/context/theme-context'
import { useMetroStore } from '@/store'
import type { VisualStation } from '@/types/metro'
import type Konva from 'konva'
import { Fragment, useMemo, useState } from 'react'
import { Line } from 'react-konva'

interface MetroTransfersProps {
  visuals: Record<string, VisualStation>
  onTransferClick?: (transfer: string) => void
}

const FALLBACK_COLOR = '#94a3b8'

const buildGradientStops = (fromColor: string, toColor: string) => [
  0,
  fromColor,
  0.35,
  fromColor,
  0.65,
  toColor,
  1,
  toColor,
]

export const MetroTransfers = ({ visuals, onTransferClick }: MetroTransfersProps) => {
  const { theme } = useTheme()
  const visualTransfers = useMetroStore((state) => state.visualTransfers)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const stations = useMetroStore((state) => state.stations)
  const lines = useMetroStore((state) => state.lines)

  const routeVisualIds = useRoute()?.visualIds

  const [hoveredTransfer, setHoveredTransfer] = useState<string | null>(null)

  const outlineColor = CANVAS_TRANSFER_OUTLINE[theme]
  const hoverColor = CANVAS_HOVER_COLOR[theme]
  const dimmedColor = CANVAS_DIMMED_COLOR[theme]

  const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
    const stage = e.target.getStage()
    if (stage) stage.container().style.cursor = 'pointer'
    setHoveredTransfer(id)
  }

  const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (stage) stage.container().style.cursor = 'default'
    setHoveredTransfer(null)
  }

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, transferId: string) => {
    e.cancelBubble = true
    onTransferClick?.(transferId)
  }

  const visualColors = useMemo(() => {
    const map: Record<string, string> = {}

    for (const visualId of Object.keys(visuals)) {
      const stationId = visualToStations[visualId]?.[0]
      const station = stationId ? stations.find((s) => s.id === stationId) : undefined
      const line = station ? lines.find((l) => String(l.id) === String(station.line_id)) : undefined

      map[visualId] = line?.color ?? FALLBACK_COLOR
    }

    return map
  }, [visuals, visualToStations, stations, lines])

  return (
    <>
      {visualTransfers.map((transfer) => {
        const from = visuals[transfer.from_visual_id]
        const to = visuals[transfer.to_visual_id]

        if (!from || !to) return null

        const fromColor = visualColors[transfer.from_visual_id] ?? FALLBACK_COLOR
        const toColor = visualColors[transfer.to_visual_id] ?? FALLBACK_COLOR

        const points = [from.x, from.y, to.x, to.y]
        const isHovered = hoveredTransfer === transfer.id

        const isDimmed = routeVisualIds
          ? !routeVisualIds.has(transfer.from_visual_id) ||
            !routeVisualIds.has(transfer.to_visual_id)
          : false

        const gradientProps =
          isHovered || isDimmed
            ? {}
            : {
                strokeLinearGradientStartPoint: { x: from.x, y: from.y },
                strokeLinearGradientEndPoint: { x: to.x, y: to.y },
                strokeLinearGradientColorStops: buildGradientStops(fromColor, toColor),
              }

        const baseColor = isDimmed ? dimmedColor : undefined

        const interactiveProps = isDimmed
          ? { listening: false }
          : {
              listening: true,
              onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) =>
                handleMouseEnter(e, transfer.id),
              onMouseLeave: handleMouseLeave,
              onClick: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) =>
                handleClick(e, transfer.id),
              onTap: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) =>
                handleClick(e, transfer.id),
            }

        return (
          <Fragment key={transfer.id}>
            {/* Подложка (не слушает события) */}
            <Line
              points={points}
              stroke={outlineColor}
              strokeWidth={5}
              dash={[6, 6]}
              opacity={0.8}
              lineCap="round"
              listening={false}
            />
            {/* Основная линия */}
            <Line
              points={points}
              stroke={isHovered ? hoverColor : baseColor}
              strokeWidth={3}
              dash={[6, 6]}
              opacity={0.95}
              lineCap="round"
              hitStrokeWidth={20}
              {...gradientProps}
              {...interactiveProps}
            />
          </Fragment>
        )
      })}
    </>
  )
}
