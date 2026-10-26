'use client'

import { Button } from '@/components/ui/Button'
import { WalkIcon } from '@/components/ui/Icons'
import { InfoRow } from '@/components/ui/InfoRow/InfoRow'
import { Input } from '@/components/ui/Input/Input'
import { useTranslations } from 'next-intl'
import { useTimeEditor } from '../../hooks/useTimeEditor'
import styles from './EditTransferModal.module.css'

interface EditTransferModalProps {
  onClose: () => void
  fromStationName: string
  toStationName: string
  fromColor?: string
  toColor?: string
  timeMinutes: number
  onSave: (timeMinutes: number) => Promise<void>
  onDelete: () => Promise<void>
}

export const EditTransferModal = ({
  onClose,
  fromStationName,
  toStationName,
  fromColor,
  toColor,
  timeMinutes,
  onSave,
  onDelete,
}: EditTransferModalProps) => {
  const t = useTranslations('EditTransferModal')

  const { time, isLoading, isSaveDisabled, handleTimeChange, handleSave, runAction } =
    useTimeEditor({
      initialMinutes: timeMinutes,
      onSave,
      onSuccess: onClose,
      onSaveError: () => alert(t('errorSave')),
    })

  const handleDelete = async () => {
    if (isLoading) return

    const confirmed = window.confirm(
      t('confirmDelete', { from: fromStationName, to: toStationName })
    )

    if (!confirmed) return

    await runAction(onDelete, (error) => {
      console.error('Failed to delete transfer:', error)
      alert(t('errorDelete'))
    })
  }

  return (
    <div className={styles.content}>
      <InfoRow label={t('from')} value={fromStationName} color={fromColor} indicatorType="bar" />

      <div className={styles.walkRow}>
        <WalkIcon className={styles.walkIcon} fromColor={fromColor} toColor={toColor} size={28} />
        <div className={styles.timeControl}>
          <div className={styles.timeField}>
            <Input type="text" value={time} onChange={handleTimeChange} disabled={isLoading} />
          </div>

          <span className={styles.timeUnit}>{t('minutes')}</span>
        </div>
      </div>

      <InfoRow label={t('to')} value={toStationName} color={toColor} indicatorType="bar" />

      <div className={styles.actions}>
        <Button
          title={t('delete')}
          variant="outlineColored"
          color="danger"
          onClick={handleDelete}
          disabled={isLoading}
        />

        <Button
          title={t('save')}
          variant="outlineColored"
          color="success"
          onClick={handleSave}
          loading={isLoading}
          disabled={isSaveDisabled}
        />
      </div>
    </div>
  )
}
