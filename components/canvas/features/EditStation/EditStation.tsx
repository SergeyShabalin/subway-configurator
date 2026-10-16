'use client'

import { Button } from '@/components/ui/Button'
import { InfoRow } from '@/components/ui/InfoRow/InfoRow'
import { Input } from '@/components/ui/Input/Input'
import { stationsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './EditStation.module.css'

interface EditStationProps {
  stationId: string
  onSuccess?: () => Promise<void>
  onCreateTransfer?: () => void
}

const EditStation = ({ stationId, onSuccess, onCreateTransfer }: EditStationProps) => {
  const t = useTranslations('EditStation')

  const station = useMetroStore((state) => state.stations.find((s) => s.id === stationId))
  const stations = useMetroStore((state) => state.stations)
  const lines = useMetroStore((state) => state.lines)
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

  const stationVisualId = useMemo(() => {
    return Object.entries(visualToStations).find(([, stationIds]) =>
      stationIds.includes(stationId)
    )?.[0]
  }, [visualToStations, stationId])

  const stationTransfers = useMemo(() => {
    if (!stationVisualId) return []
    return visualTransfers.filter(
      (transfer) =>
        transfer.from_visual_id === stationVisualId || transfer.to_visual_id === stationVisualId
    )
  }, [visualTransfers, stationVisualId])

  const currentLine = useMemo(() => {
    if (!station) return null
    return lines.find((line) => String(line.id) === String(station.line_id)) ?? null
  }, [lines, station])

  const transfersWithDetails = useMemo(() => {
    return stationTransfers.map((transfer) => {
      const otherVisualId =
        transfer.from_visual_id === stationVisualId
          ? transfer.to_visual_id
          : transfer.from_visual_id

      const otherStationIds = visualToStations[otherVisualId] ?? []
      const otherStationId = otherStationIds[0]
      const otherStation = stations.find((s) => s.id === otherStationId)
      const otherLine = otherStation
        ? lines.find((line) => String(line.id) === String(otherStation.line_id))
        : undefined

      return {
        id: transfer.id,
        otherVisualId,
        otherStationName: otherStation?.name ?? otherVisualId,
        timeMinutes: transfer.time_minutes,
        color: otherLine?.color,
      }
    })
  }, [stationTransfers, stationVisualId, visualToStations, stations, lines])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setStationName(e.target.value)
  }, [])

  const handleSave = useCallback(async () => {
    if (!station || !stationName.trim()) return
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
  }, [station, stationName, stationId, onSuccess, t])

  const handleDelete = useCallback(async () => {
    if (!station) return

    const confirmKey = transferCount > 1 ? 'confirmDeleteTransfer' : 'confirmDelete'

    const confirmed = window.confirm(t(confirmKey, { name: station.name, count: transferCount }))

    if (!confirmed) return

    await stationsService.delete(stationId)
    await onSuccess?.()
  }, [station, transferCount, stationId, onSuccess, t])

  if (!station) return null

  const isSaveDisabled = isLoading || !stationName.trim() || stationName === station.name

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <Input
          label={t('name')}
          type="text"
          value={stationName}
          onChange={handleChange}
          disabled={isLoading}
        />
        <InfoRow
          label={t('currentLine')}
          value={currentLine?.name}
          color={currentLine?.color}
          indicatorType="dot"
        />
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

        {transfersWithDetails.length === 0 ? (
          <div className={styles.emptyTransfers}>{t('noTransfers')}</div>
        ) : (
          <ul className={styles.transferList}>
            {transfersWithDetails.map((transfer) => (
              <li key={transfer.id} className={styles.transferItem}>
                <InfoRow
                  value={transfer.otherStationName}
                  description={`${transfer.timeMinutes} мин`}
                  color={transfer.color}
                  indicatorType="bar"
                />
              </li>
            ))}
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

export { EditStation }
