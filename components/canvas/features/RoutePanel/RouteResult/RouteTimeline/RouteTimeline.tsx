import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { RouteLeg } from '../RouteLeg/RouteLeg'
import { RouteTransfer } from '../RouteTransfer/RouteTransfer'
import styles from './RouteTimeline.module.css'
import type { TimelineEntry } from './types'

interface RouteTimelineProps {
  entries: ReadonlyArray<TimelineEntry>
}

export const RouteTimeline = memo(({ entries }: RouteTimelineProps) => {
  const t = useTranslations('RoutePanel')

  if (entries.length === 0) return null

  return (
    <div className={styles.timeline}>
      <p className={styles.accessTitle}>{t('access')}</p>

      {entries.map((entry) =>
        entry.kind === 'access' ? (
          <RouteTransfer key={entry.key} {...entry.transfer} />
        ) : (
          <div key={entry.key} className={styles.segment}>
            {entry.transferBefore && <RouteTransfer {...entry.transferBefore} />}
            <RouteLeg leg={entry.leg} />
          </div>
        )
      )}

      <p className={styles.accessTitle}>{t('exit')}</p>
    </div>
  )
})

RouteTimeline.displayName = 'RouteTimeline'
