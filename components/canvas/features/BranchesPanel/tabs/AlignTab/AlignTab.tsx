'use client'

import { Dropdown } from '@/components/ui/Dropdown'
import type { Line } from '@/types/metro'
import { useTranslations } from 'next-intl'
import styles from '../../BranchesPanel.module.css'
import { AlignAxisOptions } from './components/AlignAxisOptions'
import { AlignControls } from './components/AlignControls'
import { AlignFeedback } from './components/AlignFeedback'
import { useAlignStations } from './hooks/useAlignStations'

interface AlignTabProps {
  line: Line
  isLocked: boolean
}

export const AlignTab = ({ line, isLocked }: AlignTabProps) => {
  const t = useTranslations('AlignTab')

  const { isCircular, picker, axis, feedback, controls } = useAlignStations({ line, isLocked })

  return (
    <>
      {isCircular && <p className={styles.hint}>{t('hintCircular')}</p>}

      <Dropdown
        label={t('from')}
        value={picker.startId}
        options={picker.options}
        placeholder={t('placeholder')}
        emptyMessage={t('placeholder')}
        onChange={picker.selectStart}
        disabled={picker.isDisabled}
        largeList
      />
      <Dropdown
        label={t('to')}
        value={picker.endId}
        options={picker.options}
        placeholder={t('placeholder')}
        emptyMessage={t('placeholder')}
        onChange={picker.selectEnd}
        disabled={picker.isDisabled}
        largeList
      />

      <AlignAxisOptions axis={axis} />
      <AlignFeedback feedback={feedback} />
      <AlignControls controls={controls} />
    </>
  )
}
