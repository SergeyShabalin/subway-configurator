'use client'

import { Input } from '@/components/ui/Input/Input'
import { useTranslations } from 'next-intl'
import type { ChangeEvent } from 'react'
import type { LineOption } from '../../types'
import styles from '../EditStationModal.module.css'
import { StationLines } from './StationLines'

interface StationInfoSectionProps {
  name: string
  onNameChange: (e: ChangeEvent<HTMLInputElement>) => void
  disabled: boolean
  lineOptions: Array<LineOption>
  currentLineName?: string
  currentLineColor?: string
}

export const StationInfoSection = ({
  name,
  onNameChange,
  disabled,
  lineOptions,
  currentLineName,
  currentLineColor,
}: StationInfoSectionProps) => {
  const t = useTranslations('EditStation')

  return (
    <div className={styles.info}>
      <Input
        label={t('name')}
        type="text"
        value={name}
        onChange={onNameChange}
        disabled={disabled}
      />

      <StationLines
        lineOptions={lineOptions}
        currentLineName={currentLineName}
        currentLineColor={currentLineColor}
      />
    </div>
  )
}
