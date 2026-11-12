'use client'

import { EditStationModal } from './EditStationModal/EditStationModal'
import { useEditStationActions } from './hooks/useEditStationActions'
import { useSelectedStationData } from './hooks/useSelectedStationData'

interface EditStationProps {
  isOpen: boolean
  stationId: string | null
  onClose: () => void
  reloadData: () => Promise<void>
}

export const EditStation = ({ isOpen, stationId, onClose, reloadData }: EditStationProps) => {
  const station = useSelectedStationData(stationId)
  const { saveName, deleteStation } = useEditStationActions(stationId, reloadData)

  if (!station) return null

  return (
    <EditStationModal
      key={stationId ?? 'empty'}
      isOpen={isOpen}
      onClose={onClose}
      stationId={stationId}
      station={station}
      onSave={saveName}
      onDelete={deleteStation}
    />
  )
}
