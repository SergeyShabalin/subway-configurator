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
  const [transferVisualId, setTransferVisualId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  const lineOptions: Array<DropdownOption<string>> = lines.map((line) => ({
    value: line.id,
    label: line.name,
    color: line.color,
  }))

  // Одна опция на узел: название станции и цвета всех веток, которые через него проходят
  const transferOptions: Array<DropdownOption<string>> = useMemo(() => {
    if (!selectedLineId) return []

    const stationById = new Map(stations.map((s) => [s.id, s]))
    const colorByLineId = new Map(lines.map((l) => [String(l.id), l.color]))

    const options: Array<DropdownOption<string>> = []

    for (const [visualId, stationIds] of Object.entries(visualToStations)) {
      const nodeStations = stationIds.flatMap((id) => {
        const station = stationById.get(id)
        return station ? [station] : []
      })

      if (nodeStations.length === 0) continue

      // Станция уже есть на выбранной ветке, добавить её туда второй раз нельзя
      if (nodeStations.some((s) => String(s.line_id) === String(selectedLineId))) continue

      const colors = [
        ...new Set(
          nodeStations.flatMap((s) => {
            const color = colorByLineId.get(String(s.line_id))
            return color ? [color] : []
          })
        ),
      ]

      options.push({ value: visualId, label: nodeStations[0].name, colors })
    }

    return options.sort((a, b) => a.label.localeCompare(b.label))
  }, [stations, lines, visualToStations, selectedLineId])

  const selectedTransfer = transferOptions.find((o) => o.value === transferVisualId)
  const resolvedName = selectedTransfer?.label ?? stationName

  const handleLineChange = (lineId: string) => {
    setSelectedLineId(lineId)
    // Список переходов зависит от ветки, прежний выбор мог стать недопустимым
    setTransferVisualId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolvedName.trim() || !selectedLineId) return

    setIsLoading(true)

    try {
      await stationsService.create({
        name: resolvedName,
        lineId: selectedLineId,
        x: position.x,
        y: position.y,
        transferToVisualId: transferVisualId || undefined,
        timeMinutes,
      })

      await loadData()

      setStationName('')
      setSelectedLineId('')
      setTransferVisualId('')
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
