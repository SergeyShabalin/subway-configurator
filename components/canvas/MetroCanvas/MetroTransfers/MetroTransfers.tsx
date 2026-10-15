'use client'

import { useMetroStore } from '@/store'
import type { VisualStation } from '@/types/metro'
import { Fragment, useMemo } from 'react'
import { Line } from 'react-konva'

interface MetroTransfersProps {
  visuals: Record<string, VisualStation>
}

const FALLBACK_COLOR = '#94a3b8'
const OUTLINE_COLOR = '#0f172a'

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

export const MetroTransfers = ({ visuals }: MetroTransfersProps) => {
  const visualTransfers = useMetroStore((state) => state.visualTransfers)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const stations = useMetroStore((state) => state.stations)
  const lines = useMetroStore((state) => state.lines)

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
        const gradientStops = buildGradientStops(fromColor, toColor)

        return (
          <Fragment key={transfer.id}>
            <Line
              points={points}
              stroke={OUTLINE_COLOR}
              strokeWidth={5}
              dash={[6, 6]}
              opacity={0.8}
              lineCap="round"
              listening={false}
            />

            <Line
              points={points}
              strokeWidth={3}
              dash={[6, 6]}
              opacity={0.95}
              lineCap="round"
              listening={false}
              strokeLinearGradientStartPoint={{ x: from.x, y: from.y }}
              strokeLinearGradientEndPoint={{ x: to.x, y: to.y }}
              strokeLinearGradientColorStops={gradientStops}
            />
          </Fragment>
        )
      })}
    </>
  )
}
