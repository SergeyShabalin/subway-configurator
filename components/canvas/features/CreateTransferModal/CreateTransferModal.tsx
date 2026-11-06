'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown'
import { TransferIcon } from '@/components/ui/Icons/TransferIcon/TransferIcon'
import { Input } from '@/components/ui/Input/Input'
import { Modal } from '@/components/ui/Modal/Modal'
import { transfersService } from '@/src/lib/services'
import { TransferStyle } from '@/src/lib/services/transfers.service'
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

const DEFAULT_STYLE: TransferStyle = 'dashed'

export const CreateTransferModal = ({
  isOpen,
  fromVisualId,
  existingTransferIds,
  onCancel,
  onSuccess,
}: CreateTransferModalProps) => {
  const t = useTranslations('CreateTransferModal')

  const visuals = useMetroStore((state) => state.visuals)
  const stations = useMetroStore((state) => state.stations)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const lines = useMetroStore((state) => state.lines)
  const loadData = useMetroStore((state) => state.loadData)

  const [selectedVisualId, setSelectedVisualId] = useState('')
  const [timeMinutes, setTimeMinutes] = useState(3)
  const [transferStyle, setTransferStyle] = useState<TransferStyle>(DEFAULT_STYLE)
  const [isLoading, setIsLoading] = useState(false)

  const styleOptions = useMemo<Array<DropdownOption<TransferStyle>>>(
    () => [
      { value: 'dashed', label: t('styleDashed') },
      { value: 'dotted', label: t('styleDotted') },
      { value: 'solid', label: t('styleSolid') },
    ],
    [t]
  )

  const options = useMemo<Array<DropdownOption<string>>>(() => {
    const fromStationId = (visualToStations[fromVisualId] ?? [])[0]
    const fromStation = fromStationId ? stations.find((s) => s.id === fromStationId) : undefined
    const fromLineId = fromStation?.line_id

    return Object.values(visuals)
      .filter((v) => v.id !== fromVisualId)
      .filter((v) => !existingTransferIds.includes(v.id))
      .filter((v) => {
        const stationId = (visualToStations[v.id] ?? [])[0]
        const station = stationId ? stations.find((s) => s.id === stationId) : undefined
        return station?.line_id !== fromLineId
      })
      .map((v) => {
        const stationId = (visualToStations[v.id] ?? [])[0]
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
        style: transferStyle,
      })

      await loadData()
      setSelectedVisualId('')
      setTimeMinutes(3)
      setTransferStyle(DEFAULT_STYLE)
      await onSuccess?.()
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

        <Dropdown
          value={transferStyle}
          options={styleOptions}
          onChange={setTransferStyle}
          label={t('styleLabel')}
          placeholder={t('stylePlaceholder')}
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
