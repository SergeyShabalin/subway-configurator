'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import type { DropdownOption } from '@/components/ui/Dropdown/Dropdown'
import { Input } from '@/components/ui/Input/Input'
import { stationsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
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
  const { lines, loadData } = useMetroStore()

  const [stationName, setStationName] = useState('')
  const [selectedLineId, setSelectedLineId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  const lineOptions: Array<DropdownOption<string>> = lines.map((line) => ({
    value: line.id,
    label: line.name,
    color: line.color,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stationName.trim() || !selectedLineId) return

    setIsLoading(true)

    try {
      await stationsService.create({
        name: stationName,
        lineId: selectedLineId,
        x: position.x,
        y: position.y,
      })

      await loadData()

      setStationName('')
      setSelectedLineId('')
      setIsLoading(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating station:', error)
      alert(t('errorCreate'))
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Input
          type="text"
          label={t('nameLabel')}
          value={stationName}
          onChange={(e) => setStationName(e.target.value)}
          placeholder={t('namePlaceholder')}
          autoFocus
        />
      </div>

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
          disabled={!stationName.trim() || !selectedLineId}
        />
      </div>
    </form>
  )
}
