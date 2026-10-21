'use client'

import { Button } from '@/components/ui/Button'
import { InfoRow } from '@/components/ui/InfoRow/InfoRow'
import { Input } from '@/components/ui/Input/Input'
import { Modal } from '@/components/ui/Modal/Modal'
import { useTranslations } from 'next-intl'
import type { ChangeEvent } from 'react'
import { useCallback, useState } from 'react'
import { CreateTransferModal } from '../../CreateTransferModal/CreateTransferModal'
import styles from './EditStationModal.module.css'

interface TransferItem {
  id: string
  otherStationName: string
  timeMinutes: number
  color?: string
}

interface EditStationModalProps {
  isOpen: boolean
  onClose: () => void
  stationName: string
  currentLineName?: string
  currentLineColor?: string
  transfers: Array<TransferItem>
  transferCount: number
  fromVisualId?: string
  existingTransferIds: Array<string>
  onSave: (name: string) => Promise<void>
  onDelete: () => Promise<void>
}

export const EditStationModal = ({
  isOpen,
  onClose,
  stationName: initialName,
  currentLineName,
  currentLineColor,
  transfers,
  transferCount,
  fromVisualId,
  existingTransferIds,
  onSave,
  onDelete,
}: EditStationModalProps) => {
  const t = useTranslations('EditStation')
  const [stationName, setStationName] = useState(initialName)
  const [isLoading, setIsLoading] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setStationName(e.target.value)
  }, [])

  const handleSave = useCallback(async () => {
    if (!stationName.trim()) return
    if (stationName === initialName) return

    setIsLoading(true)

    try {
      await onSave(stationName.trim())
      onClose()
    } catch (error) {
      console.error('Error updating station name:', error)
      alert(t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }, [stationName, initialName, onSave, onClose, t])

  const handleDelete = useCallback(async () => {
    const confirmKey = transferCount > 1 ? 'confirmDeleteTransfer' : 'confirmDelete'

    const confirmed = window.confirm(t(confirmKey, { name: initialName, count: transferCount }))

    if (!confirmed) return

    await onDelete()
    onClose()
  }, [initialName, transferCount, onDelete, onClose, t])

  const handleOpenTransfer = useCallback(() => {
    setIsTransferModalOpen(true)
  }, [])

  const handleCloseTransfer = useCallback(async () => {
    setIsTransferModalOpen(false)
  }, [])

  const isSaveDisabled = isLoading || !stationName.trim() || stationName === initialName

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('title')}>
        <div className={styles.container}>
          <div className={styles.info}>
            <Input
              label={t('name')}
              type="text"
              value={stationName}
              onChange={handleChange}
              disabled={isLoading}
            />
            <InfoRow
              label={t('currentLine')}
              value={currentLineName}
              color={currentLineColor}
              indicatorType="dot"
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>{t('transfers')}</span>

              <Button
                title={t('createTransfer')}
                variant="outlineColored"
                color="primary"
                size="small"
                onClick={handleOpenTransfer}
                disabled={!fromVisualId}
              />
            </div>

            {transfers.length === 0 ? (
              <div className={styles.emptyTransfers}>{t('noTransfers')}</div>
            ) : (
              <ul className={styles.transferList}>
                {transfers.map((transfer) => (
                  <li key={transfer.id} className={styles.transferItem}>
                    <InfoRow
                      value={transfer.otherStationName}
                      description={`${transfer.timeMinutes} мин`}
                      color={transfer.color}
                      indicatorType="bar"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.actions}>
            <Button
              title={t('save')}
              variant="outlineColored"
              color="success"
              onClick={handleSave}
              loading={isLoading}
              disabled={isSaveDisabled}
            />

            <Button
              title={t('delete')}
              variant="outlineColored"
              color="danger"
              onClick={handleDelete}
              disabled={isLoading}
            />
          </div>
        </div>
      </Modal>

      {fromVisualId && (
        <CreateTransferModal
          isOpen={isTransferModalOpen}
          fromVisualId={fromVisualId}
          existingTransferIds={existingTransferIds}
          onCancel={handleCloseTransfer}
          onSuccess={handleCloseTransfer}
        />
      )}
    </>
  )
}
