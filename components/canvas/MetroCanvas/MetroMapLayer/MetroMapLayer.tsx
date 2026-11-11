// MetroMapLayer/MetroMapLayer.tsx
'use client'

import { MetroTransfers } from '@/components/canvas/MetroCanvas/MetroMapLayer/MetroTransfers/MetroTransfers'
import { useTransferDrop } from '@/components/canvas/MetroCanvas/transferDrop/hooks/useTransferDrop'
import type { TransferDraft } from '@/components/canvas/MetroCanvas/transferDrop/types'
import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { memo, useMemo, useRef } from 'react'
import { Layer } from 'react-konva'
import type { CanvasSelection } from '../hooks/useCanvasSelection'
import { useLabelMove } from '../hooks/useLabelMove'
import { MetroLabels } from './MetroLabels/MetroLabels'
import { MetroLineBadges } from './MetroLineBadges/MetroLineBadges'
import { useLineBadgeMove } from './MetroLineBadges/hooks/useLineBadgeMove'
import { MetroLines } from './MetroLines/MetroLines'
import { MetroStations } from './MetroStations/MetroStations'

interface MetroMapLayerProps {
  selection: CanvasSelection
  onTransferDrop: (draft: TransferDraft) => void
}

/** Содержимое слоя карты. Imperative-ссылки на узлы нужны только ему. */
export const MetroMapLayer = memo(({ selection, onTransferDrop }: MetroMapLayerProps) => {
  const lineRef = useRef<Record<string, Konva.Line>>({})
  const textRef = useRef<Record<string, Konva.Text>>({})

  const visuals = useMetroStore((state) => state.visuals)
  const stations = useMetroStore((state) => state.stations)

  const handleLabelMove = useLabelMove()
  const handleBadgeMove = useLineBadgeMove()
  const transferDrop = useTransferDrop({ onDrop: onTransferDrop })

  const stationNames = useMemo(() => {
    const map: Record<string, string> = {}
    for (const station of stations) map[station.id] = station.name
    return map
  }, [stations])

  return (
    <Layer>
      <MetroLines visuals={visuals} lineRef={lineRef} onSegmentClick={selection.segment.select} />
      <MetroTransfers visuals={visuals} onTransferClick={selection.transfer.select} />
      <MetroStations
        lineRef={lineRef}
        textRef={textRef}
        onStationClick={selection.station.select}
        transferDrop={transferDrop}
      />
      <MetroLineBadges onBadgeMove={handleBadgeMove} />
      <MetroLabels stationNames={stationNames} textRef={textRef} onLabelMove={handleLabelMove} />
    </Layer>
  )
})

MetroMapLayer.displayName = 'MetroMapLayer'
