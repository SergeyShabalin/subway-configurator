'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import type { DropdownOption } from 'components/ui/Dropdown'
import { TransferIcon } from '@/components/ui/Icons/TransferIcon/TransferIcon'
import { Input } from '@/components/ui/Input/Input'
import { Modal } from '@/components/ui/Modal/Modal'
import { transfersService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import styles from './CreateTransferModal.module.css'

interface CreateTransferModalProps {
  isOpen: boolean
  fromVisualId: string
  existingTransferIds: Array<string>
  onCancel: () => void
  onSuccess?: () => Promise<void>
}

export const CreateTransferModal = ({
  isOpen,
  fromVisualId,
  existingTransferIds,
  onCancel,
  onSuccess,
}: CreateTransferModalProps) => {
  const t = useTranslations('CreateTransferModal')
  const { visuals, stations, visualToStations, lines, loadData } = useMetroStore()

  const [selectedVisualId, setSelectedVisualId] = useState('')
  const [timeMinutes, setTimeMinutes] = useState(3)
  const [isLoading, setIsLoading] = useState(false)

  const options: Array<DropdownOption<string>> = useMemo(() => {
    const fromStationIds = visualToStations[fromVisualId] ?? []
    const fromStationId = fromStationIds[0]
    const fromStation = fromStationId ? stations.find((s) => s.id === fromStationId) : undefined
    const fromLineId = fromStation?.line_id

    return Object.values(visuals)
      .filter((v) => v.id !== fromVisualId)
      .filter((v) => !existingTransferIds.includes(v.id))
      .filter((v) => {
        const stationIds = visualToStations[v.id] ?? []
        const stationId = stationIds[0]
        const station = stationId ? stations.find((s) => s.id === stationId) : undefined
        return station?.line_id !== fromLineId
      })
      .map((v) => {
        const stationIds = visualToStations[v.id] ?? []
        const stationId = stationIds[0]
        const station = stations.find((s) => s.id === stationId)
        const line = station
          ? lines.find((l) => String(l.id) === String(station.line_id))
          : undefined

        return {
          value: v.id,
          label: station?.name ?? v.id,
          color: line?.color,
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [visuals, stations, lines, visualToStations, fromVisualId, existingTransferIds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVisualId) return

    setIsLoading(true)

    try {
      await transfersService.create({
        fromVisualId,
        toVisualId: selectedVisualId,
        timeMinutes,
      })

      await loadData()
      setSelectedVisualId('')
      setTimeMinutes(3)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating transfer:', error)

      if (error instanceof Error && error.message.includes('ALREADY_EXISTS')) {
        alert(t('errorAlreadyExists'))
      } else if (error instanceof Error && error.message.includes('SAME_VISUAL')) {
        alert(t('errorSameVisual'))
      } else {
        alert(t('errorCreate'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={t('title')} icon={<TransferIcon />}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Dropdown
          value={selectedVisualId}
          options={options}
          onChange={setSelectedVisualId}
          label={t('targetLabel')}
          placeholder={t('targetPlaceholder')}
          emptyMessage={t('noTargets')}
        />

        <Input
          type="text"
          label={t('timeLabel')}
          value={String(timeMinutes)}
          onChange={(e) => setTimeMinutes(Number(e.target.value) || 0)}
        />

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
            disabled={!selectedVisualId}
          />
        </div>
      </form>
    </Modal>
  )
}
