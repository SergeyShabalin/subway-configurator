import { StepsIcon } from '@/components/ui/Icons/StepsIcon/StepsIcon'
import { useTranslations } from 'next-intl'
import styles from './RouteTransfer.module.css'

interface RouteTransferProps {
  fromStation: string
  toStation: string
  fromColor: string
  toColor: string
  minutes: number
}

export const RouteTransfer = ({
  fromStation,
  toStation,
  fromColor,
  toColor,
  minutes,
}: RouteTransferProps) => {
  const t = useTranslations('RoutePanel')

  return (
    <div className={styles.transfer}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <StepsIcon className={styles.icon} />
          <span className={styles.title}>{t('transfer')}</span>
        </div>
        <span className={styles.badge}>{t('minutes', { minutes })}</span>
      </div>

      <div className={styles.stations}>
        <div className={styles.stationWithColor}>
          <span className={styles.colorBar} style={{ backgroundColor: fromColor }} />
          <span>{fromStation}</span>
        </div>

        <span className={styles.arrow}>→</span>

        <div className={styles.stationWithColor}>
          <span className={styles.colorBar} style={{ backgroundColor: toColor }} />
          <span>{toStation}</span>
        </div>
      </div>
    </div>
  )
}
