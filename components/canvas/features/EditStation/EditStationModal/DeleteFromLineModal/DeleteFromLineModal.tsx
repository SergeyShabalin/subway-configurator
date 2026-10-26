'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import type { DropdownOption } from 'components/ui/Dropdown'
import { Modal } from '@/components/ui/Modal/Modal'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import styles from './DeleteFromLineModal.module.css'

export type DeleteScope = { type: 'all' } | { type: 'line'; stationId: string }

export interface LineOption {
  stationId: string
  lineId: string
  lineName: string
  lineColor: string
}

interface DeleteFromLineModalProps {
  isOpen: boolean
  onClose: () => void
  stationName: string
  options: Array<LineOption>
  defaultStationId: string | null
  loading: boolean
  onConfirm: (scope: DeleteScope) => void
}

const ALL = '__all__'

export const DeleteFromLineModal = ({
  isOpen,
  onClose,
  stationName,
  options,
  defaultStationId,
  loading,
  onConfirm,
}: DeleteFromLineModalProps) => {
  const t = useTranslations('EditStation')

  const [selected, setSelected] = useState(
    options.some((o) => o.stationId === defaultStationId)
      ? (defaultStationId as string)
      : (options[0]?.stationId ?? ALL)
  )

  const dropdownOptions = useMemo((): Array<DropdownOption<string>> => {
    const lineItems = options.map((option) => ({
      value: option.stationId,
      label: option.lineName,
      color: option.lineColor,
    }))

    return [...lineItems, { value: ALL, label: t('deleteFromLineAll') }]
  }, [options, t])

  const handleConfirm = () => {
    onConfirm(selected === ALL ? { type: 'all' } : { type: 'line', stationId: selected })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('deleteFromLineTitle', { name: stationName })}
    >
      <div className={styles.form}>
        <div className={styles.field}>
          <Dropdown
            value={selected}
            options={dropdownOptions}
            onChange={setSelected}
            label={t('deleteFromLineLabel')}
            placeholder={t('deleteFromLineLabel')}
            disabled={loading}
          />
        </div>

        <div className={styles.spacer} />

        <div className={styles.actions}>
          <Button
            title={t('cancel')}
            variant="outline"
            size="medium"
            onClick={onClose}
            disabled={loading}
          />
          <Button
            title={t('delete')}
            variant="outlineColored"
            color="danger"
            size="medium"
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          />
        </div>
      </div>
    </Modal>
  )
}
