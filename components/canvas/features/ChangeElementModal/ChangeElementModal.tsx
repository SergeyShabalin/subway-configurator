'use client'

import { ChangeLabelForm } from '@/components/canvas/features/ChangeLabelForm/ChangeLabelForm'
import { CreateTransferModal } from '@/components/canvas/features/CreateTransferModal/CreateTransferModal'
import { Modal } from '@/components/ui/Modal/Modal'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface ChangeElementModalProps {
  isOpen: boolean
  onClose: () => void
  stationId: string | null
  onSuccess?: () => Promise<void>
}

export const ChangeElementModal = ({
  isOpen,
  onClose,
  stationId,
  onSuccess,
}: ChangeElementModalProps) => {
  const t = useTranslations('ChangeElementModal')
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)

  const visualToStations = useMetroStore((state) => state.visualToStations)
  const visualTransfers = useMetroStore((state) => state.visualTransfers)

  if (!isOpen || !stationId) {
    return null
  }

  const handleSuccess = async () => {
    await onSuccess?.()
    onClose()
  }

  const stationVisualId = Object.entries(visualToStations).find(([, stationIds]) =>
    stationIds.includes(stationId)
  )?.[0]

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('title')}>
        <ChangeLabelForm
          key={stationId}
          stationId={stationId}
          onSuccess={handleSuccess}
          onCreateTransfer={() => setIsTransferModalOpen(true)}
        />
      </Modal>

      {stationVisualId && (
        <CreateTransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          fromVisualId={stationVisualId}
          existingTransferIds={visualTransfers
            .filter(
              (tr) => tr.from_visual_id === stationVisualId || tr.to_visual_id === stationVisualId
            )
            .map((tr) =>
              tr.from_visual_id === stationVisualId ? tr.to_visual_id : tr.from_visual_id
            )}
          onSuccess={async () => {
            setIsTransferModalOpen(false)
            await onSuccess?.()
          }}
        />
      )}
    </>
  )
}
