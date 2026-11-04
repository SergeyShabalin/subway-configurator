'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import type { Line } from '@/types/metro'
import { useTranslations } from 'next-intl'
import { useAlignStations } from '../hooks/useAlignStations'
import styles from './AlignStationsTab.module.css'

interface AlignStationsTabProps {
  line: Line
}

export const AlignStationsTab = ({ line }: AlignStationsTabProps) => {
  const t = useTranslations('AlignStationsTab')

  const {
    options,
    startId,
    endId,
    selectStart,
    selectEnd,
    status,
    alignedCount,
    sharedCount,
    problem,
    canAlign,
    canUndo,
    isSaving,
    isCircular,
    align,
    undo,
  } = useAlignStations(line)

  return (
    <div className={styles.root}>
      <p className={styles.hint}>{t(isCircular ? 'hintCircular' : 'hint')}</p>
      <Dropdown
        label={t('from')}
        value={startId}
        options={options}
        placeholder={t('placeholder')}
        emptyMessage={t('placeholder')}
        onChange={selectStart}
        disabled={isSaving}
        largeList
      />
      <Dropdown
        label={t('to')}
        value={endId}
        options={options}
        placeholder={t('placeholder')}
        emptyMessage={t('placeholder')}
        onChange={selectEnd}
        disabled={isSaving}
        largeList
      />
      {problem && <p className={styles.message}>{t(problem)}</p>}
      {!problem && sharedCount > 0 && (
        <p className={styles.warning}>{t('sharedWarning', { count: sharedCount })}</p>
      )}
      {status === 'done' && <p className={styles.success}>{t('done', { count: alignedCount })}</p>}
      {status === 'error' && <p className={styles.message}>{t('error')}</p>}
      <div className={styles.actions}>
        <Button
          title={t('apply')}
          variant="outlineColored"
          color="success"
          onClick={align}
          loading={isSaving}
          disabled={!canAlign}
        />
        <Button
          title={t('undo')}
          variant="outline"
          color="primary"
          onClick={undo}
          disabled={!canUndo}
        />
      </div>
    </div>
  )
}
