import { Tabs } from '@/components/ui/Tabs'
import { useTranslations } from 'next-intl'
import type { RouteResult as RouteResultType } from '../types'
import styles from './RouteResult.module.css'
import { RouteTimeline } from './RouteTimeline/RouteTimeline'

interface RouteResultProps {
  routes: Array<RouteResultType>
  activeIndex: number
  onSelect: (index: number) => void
}

export const RouteResult = ({ routes, activeIndex, onSelect }: RouteResultProps) => {
  const t = useTranslations('RoutePanel')

  const route = routes[activeIndex]
  if (!route) return null

  const tabs = routes.map((item, index) => ({
    value: String(index),
    label: t('alternativeTab', { minutes: item.totalMinutes }),
  }))

  const slowerBy = route.totalMinutes - routes[0].totalMinutes

  return (
    <div className={styles.result}>
      {routes.length > 1 && (
        <div className={styles.tabs}>
          <Tabs
            variant="outline"
            value={String(activeIndex)}
            onChange={(value) => onSelect(Number(value))}
            tabs={tabs}
          />
        </div>
      )}

      <div className={styles.summary}>
        <strong>{t('total', { minutes: route.totalMinutes })}</strong>
        <span>{t('transfers', { count: route.transfersCount })}</span>
        {slowerBy > 0 && <span>{t('slowerBy', { minutes: slowerBy })}</span>}
      </div>

      <div className={styles.timeline}>
        <RouteTimeline legs={route.legs} />
      </div>
    </div>
  )
}
