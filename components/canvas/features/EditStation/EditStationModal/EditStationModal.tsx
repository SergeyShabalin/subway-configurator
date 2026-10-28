'use client'

import { CreateTransferModal } from '@/components/canvas/features'
import { Button } from '@/components/ui/Button'
import { StationIcon } from '@/components/ui/Icons/StationIcon/StationIcon'
import { InfoRow } from '@/components/ui/InfoRow/InfoRow'
import { Input } from '@/components/ui/Input/Input'
import { Modal } from '@/components/ui/Modal/Modal'
import { useTranslations } from 'next-intl'
import type { ChangeEvent } from 'react'
import { useCallback, useState } from 'react'
import type { DeleteScope, LineOption } from './DeleteFromLineModal/DeleteFromLineModal'
import { DeleteFromLineModal } from './DeleteFromLineModal/DeleteFromLineModal'
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
  stationId: string | null
  stationName: string
  currentLineName?: string
  currentLineColor?: string
  transfers: Array<TransferItem>
  transferCount: number
  lineOptions: Array<LineOption>
  fromVisualId?: string
  existingTransferIds: Array<string>
  onSave: (name: string) => Promise<void>
  onDelete: (scope: DeleteScope) => Promise<void>
}

export const EditStationModal = ({
  isOpen,
  onClose,
  stationId,
  stationName: initialName,
  currentLineName,
  currentLineColor,
  transfers,
  transferCount,
  lineOptions,
  fromVisualId,
  existingTransferIds,
  onSave,
  onDelete,
}: EditStationModalProps) => {
  const t = useTranslations('EditStation')
  const [stationName, setStationName] = useState(initialName)
  const [isLoading, setIsLoading] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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

  const runDelete = useCallback(
    async (scope: DeleteScope) => {
      setIsLoading(true)

      try {
        await onDelete(scope)
        setIsDeleteModalOpen(false)
        onClose()
      } catch (error) {
        console.error('Error deleting station:', error)
        alert(t('errorDelete'))
      } finally {
        setIsLoading(false)
      }
    },
    [onDelete, onClose, t]
  )

  const handleDelete = useCallback(async () => {
    if (lineOptions.length > 1) {
      setIsDeleteModalOpen(true)
      return
    }

    const confirmKey = transferCount > 1 ? 'confirmDeleteTransfer' : 'confirmDelete'
    const confirmed = window.confirm(t(confirmKey, { name: initialName, count: transferCount }))

    if (!confirmed) return

    await runDelete({ type: 'all' })
  }, [lineOptions.length, initialName, transferCount, runDelete, t])

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
  }, [])

  const handleOpenTransfer = useCallback(() => {
    setIsTransferModalOpen(true)
  }, [])

  const handleCloseTransfer = useCallback(async () => {
    setIsTransferModalOpen(false)
  }, [])

  const isSaveDisabled = isLoading || !stationName.trim() || stationName === initialName

  const isMultiLine = lineOptions.length > 1

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('title')} icon={<StationIcon />}>
        <div className={styles.container}>
          <div className={styles.info}>
            <Input
              label={t('name')}
              type="text"
              value={stationName}
              onChange={handleChange}
              disabled={isLoading}
            />

            {isMultiLine ? (
              <div className={styles.linesList}>
                <span className={styles.linesLabel}>{t('currentLines')}</span>
                <ul className={styles.linesItems}>
                  {lineOptions.map((line) => (
                    <li key={line.stationId}>
                      <InfoRow value={line.lineName} color={line.lineColor} indicatorType="dot" />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <InfoRow
                label={t('currentLine')}
                value={currentLineName}
                color={currentLineColor}
                indicatorType="dot"
              />
            )}
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
                  <li key={transfer.id}>
                    <InfoRow
                      value={transfer.otherStationName}
                      description={`${transfer.timeMinutes} ${t('transferTimeLabel')}`}
                      color={transfer.color}
                      indicatorType="bar"
                      descriptionIndicator={transfer.color}
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

      <DeleteFromLineModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        stationName={initialName}
        options={lineOptions}
        defaultStationId={stationId}
        loading={isLoading}
        onConfirm={runDelete}
      />

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
