'use client'

import { InfoRow } from '@/components/ui/InfoRow/InfoRow'
import { useTranslations } from 'next-intl'
import type { LineOption } from '../../types'
import styles from '../EditStationModal.module.css'

interface StationLinesProps {
  lineOptions: Array<LineOption>
  currentLineName?: string
  currentLineColor?: string
}

export const StationLines = ({
  lineOptions,
  currentLineName,
  currentLineColor,
}: StationLinesProps) => {
  const t = useTranslations('EditStation')

  const isMultiLine = lineOptions.length > 1

  if (!isMultiLine) {
    return (
      <InfoRow
        label={t('currentLine')}
        value={currentLineName}
        color={currentLineColor}
        indicatorType="dot"
      />
    )
  }

  return (
    <div className={styles.linesList}>
      <span className={styles.linesLabel}>{t('currentLines')}</span>
      <ul className={styles.linesItems}>
        {lineOptions.map(({ stationId, line }) => (
          <li key={stationId}>
            <InfoRow value={line.name} color={line.color} indicatorType="dot" />
          </li>
        ))}
      </ul>
    </div>
  )
}
