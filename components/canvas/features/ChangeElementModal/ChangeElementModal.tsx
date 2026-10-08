'use client'

import { ChangeLabelForm } from '@/components/canvas/features/ChangeLabelForm/ChangeLabelForm'
import { Modal } from '@/components/ui/Modal/Modal'
import { useTranslations } from 'next-intl'

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

  if (!isOpen || !stationId) {
    return null
  }

  const handleSuccess = async () => {
    await onSuccess?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} size="medium">
      <div>
        <ChangeLabelForm stationId={stationId} onSuccess={handleSuccess} />
      </div>
    </Modal>
  )
}
