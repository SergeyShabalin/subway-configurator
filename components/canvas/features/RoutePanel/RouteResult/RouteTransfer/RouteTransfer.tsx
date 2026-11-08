import { StepsIcon } from '@/components/ui/Icons/StepsIcon/StepsIcon'
import { LineBadgeIcon } from '@/components/ui/LineBadgeIcon/LineBadgeIcon'
import { lineBadgeShape } from '@/components/ui/LineBadgeIcon/lineBadgeShape'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import type { RouteEndpoint, TransferData } from '../RouteTimeline/types'
import styles from './RouteTransfer.module.css'

const FALLBACK_COLOR = '#888888'

const Endpoint = ({ station, color = FALLBACK_COLOR, badge, type }: RouteEndpoint) => (
  <div className={styles.stationWithColor}>
    {badge ? (
      <LineBadgeIcon text={badge} color={color} shape={lineBadgeShape(type)} />
    ) : (
      <span className={styles.colorBar} style={{ backgroundColor: color }} />
    )}
    <span>{station}</span>
  </div>
)

export const RouteTransfer = memo(({ from, to, minutes }: TransferData) => {
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
        <Endpoint {...from} />
        <span className={styles.arrow}>→</span>
        <Endpoint {...to} />
      </div>
    </div>
  )
})

RouteTransfer.displayName = 'RouteTransfer'
