'use client'

import { CreateElementModal } from '@/components/canvas/features/CreateElement/CreateElementModal/CreateElementModal'
import { linesService, stationsService } from '@/src/lib/services'
import { useCreateElementData } from './hooks/useCreateElementData'
import type { AddElementProps, CreateLinePayload, CreateStationPayload } from './types'

export const CreateElement = ({ isOpen, position, onClose, reloadData }: AddElementProps) => {
  const { lineOptions, transferNodes, hasLines } = useCreateElementData()

  const handleCreateStation = async (data: CreateStationPayload) => {
    await stationsService.create(data)
    await reloadData()
  }

  const handleCreateLine = async (data: CreateLinePayload) => {
    await linesService.create(data)
    await reloadData()
  }

  return (
    <CreateElementModal
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      initialTab={hasLines ? 'station' : 'line'}
      lineOptions={lineOptions}
      transferNodes={transferNodes}
      onCreateStation={handleCreateStation}
      onCreateLine={handleCreateLine}
    />
  )
}
