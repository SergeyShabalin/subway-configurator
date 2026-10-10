'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input/Input'
import { stationsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import styles from './ChangeLabelForm.module.css'

interface ChangeLabelFormProps {
  stationId: string
  onSuccess?: () => Promise<void>
}

const ChangeLabelForm = ({ stationId, onSuccess }: ChangeLabelFormProps) => {
  const t = useTranslations('ChangeLabelForm')

  const station = useMetroStore((state) => state.stations.find((s) => s.id === stationId))

  const [stationName, setStationName] = useState(station?.name ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStationName(e.target.value)
  }

  const handleSave = async () => {
    if (!station) return
    if (!stationName.trim()) return
    if (stationName === station.name) return

    setIsLoading(true)

    try {
      await stationsService.updateName(stationId, stationName.trim())
      await onSuccess?.()
    } catch (error) {
      console.error('Error updating station name:', error)
      alert(t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!station) return

    const confirmed = window.confirm(t('confirmDelete', { name: station.name }))
    if (!confirmed) return

    await stationsService.delete(stationId)
    await onSuccess?.()
  }

  if (!station) {
    return null
  }

  const isSaveDisabled = isLoading || !stationName.trim() || stationName === station.name

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div className={styles.row}>
          <Input
            label={t('name')}
            type="text"
            value={stationName}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className={styles.row}>
          <span className={styles.label}>{t('id')}</span>
          <span className={styles.value}>{station.id}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>{t('lineId')}</span>
          <span className={styles.value}>{station.line_id}</span>
        </div>
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
  )
}

export { ChangeLabelForm }
