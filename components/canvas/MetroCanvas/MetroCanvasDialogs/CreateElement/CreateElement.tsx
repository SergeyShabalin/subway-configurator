'use client'

import { CreateElementModal } from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/CreateElement/CreateElementModal/CreateElementModal'
import { useCreateElementActions } from './hooks/useCreateElementActions'
import { useCreateElementData } from './hooks/useCreateElementData'
import type { CreateElementProps } from './types'

export const CreateElement = ({
  isOpen,
  position,
  initialLineId,
  initialInsertPosition,
  initialTransferVisualId,
  onClose,
  reloadData,
}: CreateElementProps) => {
  const { lineOptions, transferNodes, hasLines } = useCreateElementData()
  const { createStation, createLine } = useCreateElementActions(reloadData)

  return (
    <CreateElementModal
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      initialTab={hasLines ? 'station' : 'line'}
      initialLineId={initialLineId}
      initialInsertPosition={initialInsertPosition}
      initialTransferVisualId={initialTransferVisualId}
      lineOptions={lineOptions}
      transferNodes={transferNodes}
      onCreateStation={createStation}
      onCreateLine={createLine}
    />
  )
}
