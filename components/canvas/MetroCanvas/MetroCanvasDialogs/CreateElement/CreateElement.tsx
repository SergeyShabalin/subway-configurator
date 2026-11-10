'use client'

import { CreateElementModal } from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/CreateElement/CreateElementModal/CreateElementModal'
import { useCreateElementActions } from './hooks/useCreateElementActions'
import { useCreateElementData } from './hooks/useCreateElementData'
import type { CreateElementProps } from './types'

export const CreateElement = ({ isOpen, position, onClose, reloadData }: CreateElementProps) => {
  const { lineOptions, transferNodes, hasLines } = useCreateElementData()
  const { createStation, createLine } = useCreateElementActions(reloadData)

  return (
    <CreateElementModal
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      initialTab={hasLines ? 'station' : 'line'}
      lineOptions={lineOptions}
      transferNodes={transferNodes}
      onCreateStation={createStation}
      onCreateLine={createLine}
    />
  )
}
