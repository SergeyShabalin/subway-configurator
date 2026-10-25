'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import type { DropdownOption } from '@/components/ui/Dropdown/Dropdown'
import { Input } from '@/components/ui/Input/Input'
import { stationsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import styles from './AddStationForm.module.css'

interface AddStationFormProps {
  position: { x: number; y: number }
  onSuccess?: () => void
  onCancel?: () => void
  onLoadingChange?: (isLoading: boolean) => void
}

export const AddStationForm = ({
  position,
  onSuccess,
  onCancel,
  onLoadingChange,
}: AddStationFormProps) => {
  const t = useTranslations('AddStationForm')
  const { lines, stations, visualToStations, loadData } = useMetroStore()

  const [stationName, setStationName] = useState('')
  const [timeMinutes, setTimeMinutes] = useState(2)
  const [selectedLineId, setSelectedLineId] = useState('')
  const [transferStationId, setTransferStationId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  const lineOptions: Array<DropdownOption<string>> = lines.map((line) => ({
    value: line.id,
    label: line.name,
    color: line.color,
  }))

  const transferOptions: Array<DropdownOption<string>> = useMemo(() => {
    if (!selectedLineId) return []

    return stations
      .filter((s) => s.line_id !== selectedLineId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => {
        const line = lines.find((l) => l.id === s.line_id)

        return {
          value: s.id,
          label: s.name,
          color: line?.color,
        }
      })
  }, [stations, lines, selectedLineId])

  const stationToVisual = useMemo(() => {
    const map: Record<string, string> = {}

    for (const [visualId, stationIds] of Object.entries(visualToStations)) {
      for (const stationId of stationIds) {
        map[stationId] = visualId
      }
    }

    return map
  }, [visualToStations])

  const transferStation = transferStationId
    ? stations.find((s) => s.id === transferStationId)
    : undefined

  const resolvedName = transferStation?.name ?? stationName

  const handleTransferChange = (value: string) => {
    setTransferStationId(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolvedName.trim() || !selectedLineId) return

    setIsLoading(true)

    try {
      const transferToVisualId = transferStationId ? stationToVisual[transferStationId] : undefined

      await stationsService.create({
        name: resolvedName,
        lineId: selectedLineId,
        x: position.x,
        y: position.y,
        transferToVisualId,
        timeMinutes,
      })

      await loadData()

      setStationName('')
      setSelectedLineId('')
      setTransferStationId('')
      setIsLoading(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating station:', error)

      if (error instanceof Error && error.message === 'ALREADY_ON_LINE') {
        alert(t('errorAlreadyOnLine'))
      } else {
        alert(t('errorCreate'))
      }

      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Dropdown
          value={selectedLineId}
          options={lineOptions}
          onChange={setSelectedLineId}
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
          disabled={!!transferStationId}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        ssss
        <Dropdown
          value={transferStationId}
          options={transferOptions}
          onChange={handleTransferChange}
          label={t('transferLabel')}
          placeholder={t('transferPlaceholder')}
          emptyMessage={t('noTransferOptions')}
          disabled={!selectedLineId}
        />
      </div>
      <div className={styles.field}>
        <Input
          type="text"
          label={t('timeLabel')}
          value={String(timeMinutes)}
          onChange={(e) => setTimeMinutes(Number(e.target.value) || 0)}
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
          disabled={!resolvedName.trim() || !selectedLineId}
        />
      </div>
    </form>
  )
}
