import { useTranslations } from 'next-intl'
import type { RouteResult } from '../../types'

import { VerticalTimelineList } from '@/components/ui'
import { TimelineItem } from '@/components/ui/VerticalTimelineList/types'
import styles from './RouteLeg.module.css'

interface RouteLegProps {
  leg: RouteResult['legs'][0]
}

export const RouteLeg = ({ leg }: RouteLegProps) => {
  const t = useTranslations('RoutePanel')

  const timelineItems: Array<TimelineItem> = leg.stationNames.map((name, i) => ({
    id: `${leg.stationIds[i]}-${i}`,
    label: name,
  }))

  return (
    <div className={styles.leg}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.dot} style={{ background: leg.lineColor }} />
          <span className={styles.title}>{leg.lineName}</span>
        </div>
        <span className={styles.meta}>
          {t('legMeta', { count: leg.stationIds.length - 1, minutes: leg.minutes })}
        </span>
      </div>

      <VerticalTimelineList items={timelineItems} color={leg.lineColor} />
    </div>
  )
}
