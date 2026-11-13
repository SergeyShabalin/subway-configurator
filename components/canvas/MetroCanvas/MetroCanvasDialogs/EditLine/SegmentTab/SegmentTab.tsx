'use client'

import { Button } from '@/components/ui/Button'
import { SegmentIcon } from '@/components/ui/Icons/SegmentIcon/SegmentIcon'
import { InfoRow } from '@/components/ui/InfoRow/InfoRow'
import { Input } from '@/components/ui/Input/Input'
import { useTranslations } from 'next-intl'
import { useTimeEditor } from '../hooks/useTimeEditor'
import styles from './SegmentTab.module.css'
import { handleSaveSegmentError } from './helpers/handleSaveSegmentError'
import type { SegmentTabProps } from './types'

export const SegmentTab = ({ segment, onSave, onClose }: SegmentTabProps) => {
  const t = useTranslations('SegmentTab')

  const { fromStationName, toStationName, timeMinutes, lineName, lineColor } = segment

  const { time, isLoading, isSaveDisabled, handleTimeChange, handleSave } = useTimeEditor({
    initialMinutes: timeMinutes,
    onSave,
    onSuccess: onClose,
    onSaveError: () => handleSaveSegmentError(t),
  })

  return (
    <div className={styles.content}>
      <InfoRow label={t('from')} value={fromStationName} color={lineColor} indicatorType="bar" />

      <div className={styles.arrowRow}>
        <SegmentIcon color={lineColor} />

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
