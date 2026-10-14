import { MouseRightClickIcon } from '@/components/ui/Icons'
import { useTranslations } from 'next-intl'
import styles from './HintLetsStarted.module.css'

interface HintLetsStartedProps {
  hasLines: boolean
}

export const HintLetsStarted = ({ hasLines }: HintLetsStartedProps) => {
  const t = useTranslations('MetroCanvas')

  return (
    <div className={styles.hint}>
      <MouseRightClickIcon className={styles.icon} />

      {hasLines ? (
        <>
          <div className={styles.title}>{t('hintNoStationsTitle')}</div>
          <div className={styles.text}>{t('hintNoStationsText')}</div>
        </>
      ) : (
        <>
          <div className={styles.title}>{t('hintNoLinesTitle')}</div>
          <div className={styles.text}>{t('hintNoLinesText')}</div>
        </>
      )}
    </div>
  )
}
