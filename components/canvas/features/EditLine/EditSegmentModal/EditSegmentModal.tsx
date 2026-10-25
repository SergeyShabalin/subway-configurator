'use client'

import { Button } from '@/components/ui/Button'
import { ArrowIcon } from '@/components/ui/Icons'
import { InfoRow } from '@/components/ui/InfoRow/InfoRow'
import { Input } from '@/components/ui/Input/Input'
import { useTranslations } from 'next-intl'
import { useTimeEditor } from '../../hooks/useTimeEditor'
import styles from './EditSegmentModal.module.css'

interface EditSegmentModalProps {
  onClose: () => void
  fromStationName: string
  toStationName: string
  timeMinutes: number
  lineName?: string
  lineColor?: string
  onSave: (timeMinutes: number) => Promise<void>
}

export const EditSegmentModal = ({
  onClose,
  fromStationName,
  toStationName,
  timeMinutes,
  lineName,
  lineColor,
  onSave,
}: EditSegmentModalProps) => {
  const t = useTranslations('EditSegmentModal')

  const { time, isLoading, isSaveDisabled, handleTimeChange, handleSave } = useTimeEditor({
    initialMinutes: timeMinutes,
    onSave,
    onSuccess: onClose,
    onSaveError: () => alert(t('errorSave')),
  })

  return (
    <div className={styles.content}>
      <InfoRow label={t('from')} value={fromStationName} color={lineColor} indicatorType="bar" />

      <div className={styles.arrowRow}>
        <ArrowIcon />

        <div className={styles.timeControl}>
          <div className={styles.timeField}>
            <Input type="text" value={time} onChange={handleTimeChange} disabled={isLoading} />
          </div>

          <span className={styles.timeUnit}>{t('minutes')}</span>
        </div>
      </div>

      <InfoRow label={t('to')} value={toStationName} color={lineColor} indicatorType="bar" />

      {lineName && (
        <InfoRow label={t('line')} value={lineName} color={lineColor} indicatorType="dot" />
      )}

      <div className={styles.actions}>
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
