import { useTranslations } from 'next-intl'
import type { RouteResult as RouteResultType } from '../types'
import styles from './RouteResult.module.css'
import { RouteTimeline } from './RouteTimeline/RouteTimeline'

interface RouteResultProps {
  route: RouteResultType
}

export const RouteResult = ({ route }: RouteResultProps) => {
  const t = useTranslations('RoutePanel')

  return (
    <div className={styles.result}>
      <div className={styles.summary}>
        <strong>{t('total', { minutes: route.totalMinutes })}</strong>
        <span>{t('transfers', { count: route.transfersCount })}</span>
      </div>

      <RouteTimeline legs={route.legs} />
    </div>
  )
}
