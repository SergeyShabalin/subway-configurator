'use client'

import { useTranslations } from 'next-intl'
import type { useAlignStations } from '../../hooks/useAlignStations'
import styles from '../AlignStationsTab.module.css'

interface AlignFeedbackProps {
  feedback: ReturnType<typeof useAlignStations>['feedback']
}

export const AlignFeedback = ({ feedback }: AlignFeedbackProps) => {
  const t = useTranslations('AlignStationsTab')
  const { problem, sharedCount, status, alignedCount } = feedback

  return (
    <>
      {problem && <p className={styles.message}>{t(problem)}</p>}
      {!problem && sharedCount > 0 && (
        <p className={styles.warning}>{t('sharedWarning', { count: sharedCount })}</p>
      )}
      {status === 'done' && <p className={styles.success}>{t('done', { count: alignedCount })}</p>}
      {status === 'error' && <p className={styles.message}>{t('error')}</p>}
    </>
  )
}
