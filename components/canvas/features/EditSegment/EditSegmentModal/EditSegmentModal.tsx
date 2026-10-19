'use client'

import { Button } from '@/components/ui/Button'
import { ArrowIcon } from '@/components/ui/Icons'
import { InfoRow } from '@/components/ui/InfoRow/InfoRow'
import { Input } from '@/components/ui/Input/Input'
import { Modal } from '@/components/ui/Modal/Modal'
import { useTranslations } from 'next-intl'
import { type ChangeEvent, useState } from 'react'
import styles from './EditSegmentModal.module.css'

interface EditSegmentModalProps {
  isOpen: boolean
  onClose: () => void
  fromStationName: string
  toStationName: string
  timeMinutes: number
  lineName?: string
  lineColor?: string
  onSave: (timeMinutes: number) => Promise<void>
}

export const EditSegmentModal = ({
  isOpen,
  onClose,
  fromStationName,
  toStationName,
  timeMinutes,
  lineName,
  lineColor,
  onSave,
}: EditSegmentModalProps) => {
  const t = useTranslations('ChangeSegmentInfoModal')
  const [time, setTime] = useState(timeMinutes)
  const [isSaving, setIsSaving] = useState(false)

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTime(Number(e.target.value) || 0)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      await onSave(time)
      onClose()
    } catch (error) {
      console.error('Failed to save segment time:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const isDisabled = isSaving || time === timeMinutes

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')}>
      <div className={styles.content}>
        <div className={styles.fromStation}>
          <InfoRow
            value={fromStationName}
            description={t('from')}
            color={lineColor}
            indicatorType="bar"
          />
        </div>

        <div className={styles.arrowRow}>
          <ArrowIcon />

          <div className={styles.timeInput}>
            <Input
              type="text"
              value={String(time)}
              onChange={handleTimeChange}
              disabled={isSaving}
            />
            <span className={styles.timeUnit}>{t('minutes')}</span>
          </div>
        </div>

        <div className={styles.toStation}>
          <InfoRow
            value={toStationName}
            description={t('to')}
            color={lineColor}
            indicatorType="bar"
          />
        </div>

        {lineName && (
          <div className={styles.lineRow}>
            <InfoRow
              value={lineName}
              description={t('line')}
              color={lineColor}
              indicatorType="dot"
            />
          </div>
        )}

        <div className={styles.actions}>
          <Button
            title={t('save')}
            variant="outlineColored"
            color="success"
            onClick={handleSave}
            loading={isSaving}
            disabled={isDisabled}
          />
        </div>
      </div>
    </Modal>
  )
}
