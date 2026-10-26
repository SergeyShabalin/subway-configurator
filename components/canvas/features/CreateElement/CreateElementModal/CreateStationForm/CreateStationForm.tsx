'use client'

import { Button } from '@/components/ui/Button'
import type { DropdownOption } from '@/components/ui/Dropdown'
import { Dropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input/Input'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import type { CreateStationPayload, TransferNode } from '../../types'
import styles from './CreateStationForm.module.css'
import { useTimeField } from './hooks/useTimeField'

interface CreateStationFormProps {
  position: { x: number; y: number }
  lineOptions: Array<DropdownOption<string>>
  transferNodes: Array<TransferNode>
  onSubmit: (data: CreateStationPayload) => Promise<void>
  onSuccess?: () => void
  onCancel?: () => void
  onLoadingChange?: (isLoading: boolean) => void
}

const DEFAULT_TIME_MINUTES = 2

export const CreateStationForm = ({
  position,
  lineOptions,
  transferNodes,
  onSubmit,
  onSuccess,
  onCancel,
  onLoadingChange,
}: CreateStationFormProps) => {
  const t = useTranslations('CreateStationForm')

  const [stationName, setStationName] = useState('')
  const [selectedLineId, setSelectedLineId] = useState('')
  const [transferVisualId, setTransferVisualId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    time,
    minutes: timeMinutes,
    isValidTime,
    handleTimeChange,
    reset: resetTime,
  } = useTimeField(DEFAULT_TIME_MINUTES)

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  const transferOptions = useMemo((): Array<DropdownOption<string>> => {
    if (!selectedLineId) return []

    return transferNodes
      .filter((node) => !node.lineIds.includes(String(selectedLineId)))
      .map((node) => ({ value: node.visualId, label: node.name, colors: node.colors }))
  }, [transferNodes, selectedLineId])

  const selectedTransfer = transferOptions.find((o) => o.value === transferVisualId)
  const resolvedName = selectedTransfer?.label ?? stationName

  const isSubmitDisabled = isLoading || !resolvedName.trim() || !selectedLineId || !isValidTime

  const handleLineChange = (lineId: string) => {
    setSelectedLineId(lineId)
    setTransferVisualId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitDisabled) return

    setIsLoading(true)

    try {
      await onSubmit({
        name: resolvedName.trim(),
        lineId: selectedLineId,
        x: position.x,
        y: position.y,
        transferToVisualId: transferVisualId || undefined,
        timeMinutes,
      })

      setStationName('')
      setSelectedLineId('')
      setTransferVisualId('')
      resetTime()
      onSuccess?.()
    } catch (error) {
      console.error('Error creating station:', error)

      if (error instanceof Error && error.message === 'ALREADY_ON_LINE') {
        alert(t('errorAlreadyOnLine'))
      } else {
        alert(t('errorCreate'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Dropdown
          value={selectedLineId}
          options={lineOptions}
          onChange={handleLineChange}
          label={t('lineLabel')}
          placeholder={t('linePlaceholder')}
          emptyMessage={t('noLines')}
        />
      </div>

      <div className={styles.field}>
        <Input
          type="text"
          label={t('nameLabel')}
          value={resolvedName}
          onChange={(e) => setStationName(e.target.value)}
          placeholder={t('namePlaceholder')}
          disabled={!!transferVisualId}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <Dropdown
          value={transferVisualId}
          options={transferOptions}
          onChange={setTransferVisualId}
          label={t('transferLabel')}
          placeholder={t('transferPlaceholder')}
          emptyMessage={t('noTransferOptions')}
          disabled={!selectedLineId}
        />
      </div>

      <div className={styles.field}>
        <Input
          type="text"
          inputMode="numeric"
          label={t('timeLabel')}
          value={time}
          onChange={handleTimeChange}
          disabled={isLoading}
        />
      </div>

      <div className={styles.coordinates}>
        <span>{t('coordinates', { x: Math.round(position.x), y: Math.round(position.y) })}</span>
      </div>

      <div className={styles.spacer} />

      <div className={styles.actions}>
        <Button
          title={t('cancel')}
          variant="outline"
          size="medium"
          onClick={onCancel}
          disabled={isLoading}
        />
        <Button
          title={t('submit')}
          size="medium"
          type="submit"
          loading={isLoading}
          disabled={isSubmitDisabled}
        />
      </div>
    </form>
  )
}
