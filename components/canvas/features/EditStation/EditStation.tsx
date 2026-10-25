'use client'

import { stationsService } from '@/src/lib/services'
import type { DeleteScope } from './EditStationModal/DeleteFromLineModal/DeleteFromLineModal'
import { EditStationModal } from './EditStationModal/EditStationModal'
import { useSelectedStationData } from './hooks/useSelectedStationData'

interface EditStationProps {
  isOpen: boolean
  stationId: string | null
  onClose: () => void
  reloadData: () => Promise<void>
}

export const EditStation = ({ isOpen, stationId, onClose, reloadData }: EditStationProps) => {
  const stationData = useSelectedStationData(stationId)

  const handleSave = async (name: string) => {
    if (!stationId) return
    await stationsService.updateName(stationId, name)
    await reloadData()
  }

  const handleDelete = async (scope: DeleteScope) => {
    if (!stationId) return

    if (scope.type === 'line') {
      await stationsService.deleteFromLine(scope.stationId)
    } else {
      await stationsService.delete(stationId)
    }

    await reloadData()
  }

  if (!stationData) return null

  return (
    <EditStationModal
      key={stationId ?? 'empty'}
      isOpen={isOpen}
      onClose={onClose}
      stationId={stationId}
      stationName={stationData.stationName}
      currentLineName={stationData.currentLineName}
      currentLineColor={stationData.currentLineColor}
      transfers={stationData.transfers}
      transferCount={stationData.transferCount}
      lineOptions={stationData.lineOptions}
      fromVisualId={stationData.fromVisualId}
      existingTransferIds={stationData.existingTransferIds}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  )
}
