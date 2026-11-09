'use client'

import { Fragment } from 'react'

import { useRoute } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { useMetroStore } from '@/store'
import type { VisualStation } from '@/types/metro'

import { TransferLine } from '@/components/canvas/MetroCanvas/MetroMapLayer/MetroTransfers/TransferLine/TransferLine'
import { useTransferColors } from './hooks/useTransferColors'
import { useTransferInteractions } from './hooks/useTransferInteractions'

interface MetroTransfersProps {
  visuals: Record<string, VisualStation>
  onTransferClick?: (transfer: string) => void
}

export const MetroTransfers = ({ visuals, onTransferClick }: MetroTransfersProps) => {
  const visualTransfers = useMetroStore((state) => state.visualTransfers)

  const routeVisualIds = useRoute()?.visualIds

  const visualColors = useTransferColors(visuals)

  const { hoveredTransfer, handleMouseEnter, handleMouseLeave, handleClick } =
    useTransferInteractions()

  return (
    <>
      {visualTransfers.map((transfer) => {
        const from = visuals[transfer.from_visual_id]
        const to = visuals[transfer.to_visual_id]

        if (!from || !to) return null

        const isDimmed = routeVisualIds
          ? !routeVisualIds.has(transfer.from_visual_id) ||
            !routeVisualIds.has(transfer.to_visual_id)
          : false

        return (
          <Fragment key={transfer.id}>
            <TransferLine
              id={transfer.id}
              from={from}
              to={to}
              fromColor={visualColors[transfer.from_visual_id]}
              toColor={visualColors[transfer.to_visual_id]}
              hovered={hoveredTransfer === transfer.id}
              dimmed={isDimmed}
              style={transfer.style}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={(e, id) => handleClick(e, id, onTransferClick)}
            />
          </Fragment>
        )
      })}
    </>
  )
}
