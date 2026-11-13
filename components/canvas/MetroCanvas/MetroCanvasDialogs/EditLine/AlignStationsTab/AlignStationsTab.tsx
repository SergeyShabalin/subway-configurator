'use client'

import { Dropdown } from '@/components/ui/Dropdown'
import type { Line } from '@/types/metro'
import { useTranslations } from 'next-intl'
import styles from './AlignStationsTab.module.css'
import { AlignControls } from './components/AlignControls'
import { AlignFeedback } from './components/AlignFeedback'
import { useAlignStations } from './hooks/useAlignStations'

interface AlignStationsTabProps {
  line: Line
}

export const AlignStationsTab = ({ line }: AlignStationsTabProps) => {
  const t = useTranslations('AlignStationsTab')

  const { isCircular, picker, feedback, controls } = useAlignStations(line)

  return (
    <div className={styles.root}>
      <p className={styles.hint}>{t(isCircular ? 'hintCircular' : 'hint')}</p>
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
      <AlignFeedback feedback={feedback} />
      <AlignControls controls={controls} />
    </div>
  )
}
