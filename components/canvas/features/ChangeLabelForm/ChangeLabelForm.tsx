'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input/Input'
import { stationsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import styles from './ChangeLabelForm.module.css'

interface ChangeLabelFormProps {
  stationId: string
  onSuccess?: () => Promise<void>
  onCreateTransfer?: () => void
}

const ChangeLabelForm = ({ stationId, onSuccess, onCreateTransfer }: ChangeLabelFormProps) => {
  const t = useTranslations('ChangeLabelForm')

  const station = useMetroStore((state) => state.stations.find((s) => s.id === stationId))
  const visualTransfers = useMetroStore((state) => state.visualTransfers)
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const [stationName, setStationName] = useState(station?.name ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [transferCount, setTransferCount] = useState(1)

  useEffect(() => {
    let cancelled = false

    stationsService.countTransferStations(stationId).then((count) => {
      if (!cancelled) {
        setTransferCount(count)
      }
    })

    return () => {
      cancelled = true
    }
  }, [stationId])

  const stationVisualId = Object.entries(visualToStations).find(([, stationIds]) =>
    stationIds.includes(stationId)
  )?.[0]

  const stationTransfers = stationVisualId
    ? visualTransfers.filter(
        (tr) => tr.from_visual_id === stationVisualId || tr.to_visual_id === stationVisualId
      )
    : []

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

    const confirmKey = transferCount > 1 ? 'confirmDeleteTransfer' : 'confirmDelete'
    const confirmed = window.confirm(t(confirmKey, { name: station.name, count: transferCount }))

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

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>{t('transfers')}</span>
          <Button
            title={t('createTransfer')}
            variant="outlineColored"
            color="primary"
            size="small"
            onClick={onCreateTransfer}
            disabled={!stationVisualId}
          />
        </div>

        {stationTransfers.length === 0 ? (
          <div className={styles.emptyTransfers}>{t('noTransfers')}</div>
        ) : (
          <ul className={styles.transferList}>
            {stationTransfers.map((transfer) => {
              const otherVisualId =
                transfer.from_visual_id === stationVisualId
                  ? transfer.to_visual_id
                  : transfer.from_visual_id

              const otherStationIds = visualToStations[otherVisualId] ?? []
              const otherStationId = otherStationIds[0]
              const otherStation = useMetroStore
                .getState()
                .stations.find((s) => s.id === otherStationId)

              return (
                <li key={transfer.id} className={styles.transferItem}>
                  <span>{otherStation?.name ?? otherVisualId}</span>
                  <span className={styles.transferTime}>{transfer.time_minutes} min</span>
                </li>
              )
            })}
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
  )
}

export { ChangeLabelForm }
