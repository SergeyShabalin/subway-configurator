'use client'

import { CreateTransferModal } from '@/components/canvas/features'
import { StationIcon } from '@/components/ui/Icons/StationIcon/StationIcon'
import { Modal } from '@/components/ui/Modal/Modal'
import { useTranslations } from 'next-intl'
import type { DeleteScope, EditStationData } from '../types'
import { StationActions } from './components/StationActions'
import { StationInfoSection } from './components/StationInfoSection'
import { StationTransfersSection } from './components/StationTransfersSection'
import { DeleteFromLineModal } from './DeleteFromLineModal/DeleteFromLineModal'
import styles from './EditStationModal.module.css'
import { confirmDeleteStation } from './helpers/confirmDeleteStation'
import { handleDeleteStationError } from './helpers/handleDeleteStationError'
import { handleSaveStationError } from './helpers/handleSaveStationError'
import { useEditStationModal } from './hooks/useEditStationModal'

interface EditStationModalProps {
  isOpen: boolean
  onClose: () => void
  stationId: string | null
  station: EditStationData
  onSave: (name: string) => Promise<void>
  onDelete: (scope: DeleteScope) => Promise<void>
}

export const EditStationModal = ({
  isOpen,
  onClose,
  stationId,
  station,
  onSave,
  onDelete,
}: EditStationModalProps) => {
  const t = useTranslations('EditStation')

  const { state, actions } = useEditStationModal({
    station,
    onClose,
    onSave,
    onDelete,
    onSaveError: (error) => handleSaveStationError(error, t),
    onDeleteError: (error) => handleDeleteStationError(error, t),
    confirmDelete: () => confirmDeleteStation(t, station.stationName, station.transferCount),
  })

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('title')} icon={<StationIcon />}>
        <div className={styles.container}>
          <StationInfoSection
            name={state.stationName}
            onNameChange={actions.handleNameChange}
            disabled={state.isLoading}
            lineOptions={station.lineOptions}
            currentLineName={station.currentLineName}
            currentLineColor={station.currentLineColor}
          />

          <StationTransfersSection
            transfers={station.transfers}
            canCreate={Boolean(station.fromVisualId)}
            onCreate={actions.openTransferModal}
          />

          <StationActions
            isLoading={state.isLoading}
            isSaveDisabled={state.isSaveDisabled}
            onSave={actions.handleSave}
            onDelete={actions.handleDelete}
          />
        </div>
      </Modal>

      <DeleteFromLineModal
        isOpen={state.isDeleteModalOpen}
        onClose={actions.closeDeleteModal}
        stationName={station.stationName}
        options={station.lineOptions}
        defaultStationId={stationId}
        loading={state.isLoading}
        onConfirm={actions.runDelete}
      />

      {station.fromVisualId && (
        <CreateTransferModal
          isOpen={state.isTransferModalOpen}
          fromVisualId={station.fromVisualId}
          existingTransferIds={station.existingTransferIds}
          onCancel={actions.closeTransferModal}
          onSuccess={actions.closeTransferModal}
        />
      )}
    </>
  )
}
