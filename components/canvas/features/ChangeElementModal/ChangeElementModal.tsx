'use client'

import { CreateTransferModal } from '@/components/canvas/features/CreateTransferModal/CreateTransferModal'
import { EditStation } from '@/components/canvas/features/EditStation/EditStation'
import { Modal } from '@/components/ui/Modal/Modal'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'
import styles from './ChangeElementModal.module.css'

type View = 'edit' | 'transfer'

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
  const [view, setView] = useState<View>('edit')

  const visualToStations = useMetroStore((state) => state.visualToStations)
  const visualTransfers = useMetroStore((state) => state.visualTransfers)

  const stationVisualId = useMemo(() => {
    if (!stationId) return undefined
    return Object.entries(visualToStations).find(([, stationIds]) =>
      stationIds.includes(stationId)
    )?.[0]
  }, [visualToStations, stationId])

  const existingTransferIds = useMemo(() => {
    if (!stationVisualId) return []
    return visualTransfers
      .filter((tr) => tr.from_visual_id === stationVisualId || tr.to_visual_id === stationVisualId)
      .map((tr) => (tr.from_visual_id === stationVisualId ? tr.to_visual_id : tr.from_visual_id))
  }, [visualTransfers, stationVisualId])

  const handleSuccess = useCallback(async () => {
    await onSuccess?.()
    onClose()
  }, [onSuccess, onClose])

  const handleClose = useCallback(() => {
    setView('edit')
    onClose()
  }, [onClose])

  const handleOpenTransfer = useCallback(() => {
    setView('transfer')
  }, [])

  const handleCancelTransfer = useCallback(() => {
    setView('edit')
  }, [])

  const handleTransferSuccess = useCallback(async () => {
    setView('edit')
    await onSuccess?.()
  }, [onSuccess])

  if (!isOpen || !stationId) return null

  const title = view === 'edit' ? t('title') : t('transferTitle')

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className={styles.modalContent}>
        {view === 'edit' && (
          <EditStation
            key={stationId}
            stationId={stationId}
            onSuccess={handleSuccess}
            onCreateTransfer={handleOpenTransfer}
          />
        )}

        {view === 'transfer' && stationVisualId && (
          <CreateTransferModal
            fromVisualId={stationVisualId}
            existingTransferIds={existingTransferIds}
            onCancel={handleCancelTransfer}
            onSuccess={handleTransferSuccess}
          />
        )}
      </div>
    </Modal>
  )
}
