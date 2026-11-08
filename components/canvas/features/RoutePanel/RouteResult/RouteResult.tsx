import { Tabs } from '@/components/ui/Tabs'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo } from 'react'
import type { RouteResult as RouteResultType } from '../types'
import styles from './RouteResult.module.css'
import { buildTimeline } from './RouteTimeline/buildTimeline'
import { RouteTimeline } from './RouteTimeline/RouteTimeline'

interface RouteResultProps {
  routes: Array<RouteResultType>
  activeIndex: number
  onSelect: (index: number) => void
}

export const RouteResult = ({ routes, activeIndex, onSelect }: RouteResultProps) => {
  const t = useTranslations('RoutePanel')

  const route = routes[activeIndex]

  const tabs = useMemo(
    () =>
      routes.map((item, index) => ({
        value: String(index),
        label: t('alternativeTab', { minutes: item.totalMinutes }),
      })),
    [routes, t]
  )

  const entries = useMemo(() => (route ? buildTimeline(route) : []), [route])

  const handleTabChange = useCallback((value: string) => onSelect(Number(value)), [onSelect])

  if (!route) return null

  const slowerBy = route.totalMinutes - routes[0].totalMinutes

  return (
    <div className={styles.result}>
      {routes.length > 1 && (
        <div className={styles.tabs}>
          <div className={styles.tabsInner}>
            <Tabs
              variant="outline"
              value={String(activeIndex)}
              onChange={handleTabChange}
              tabs={tabs}
            />
          </div>
        </div>
      )}

      <div className={styles.summary}>
        <strong>{t('total', { minutes: route.totalMinutes })}</strong>
        <span>{t('transfers', { count: route.transfersCount })}</span>
        {slowerBy > 0 && <span>{t('slowerBy', { minutes: slowerBy })}</span>}
      </div>

      <div className={styles.timeline}>
        <RouteTimeline entries={entries} />
      </div>
    </div>
  )
}
