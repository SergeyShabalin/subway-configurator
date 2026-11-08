import { VerticalTimelineList } from '@/components/ui'
import { LineBadgeIcon } from '@/components/ui/LineBadgeIcon/LineBadgeIcon'
import { lineBadgeShape } from '@/components/ui/LineBadgeIcon/lineBadgeShape'
import type { TimelineItem, TimelineLineVariant } from '@/components/ui/VerticalTimelineList/types'
import type { LineType } from '@/types/metro'
import { useTranslations } from 'next-intl'
import { memo, useMemo } from 'react'
import type { RouteResult } from '../../types'
import styles from './RouteLeg.module.css'

interface RouteLegProps {
  leg: RouteResult['legs'][0]
}

const LINE_VARIANT: Record<LineType, TimelineLineVariant> = {
  subway: 'single',
  commuter_rail: 'double',
}

export const RouteLeg = memo(({ leg }: RouteLegProps) => {
  const t = useTranslations('RoutePanel')

  const timelineItems = useMemo<Array<TimelineItem>>(
    () =>
      leg.stationNames.map((name, i) => ({
        id: `${leg.stationIds[i]}-${i}`,
        label: name,
      })),
    [leg.stationNames, leg.stationIds]
  )

  return (
    <div className={styles.leg}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          {leg.lineBadge ? (
            <span className={styles.badge}>
              <LineBadgeIcon
                text={leg.lineBadge}
                color={leg.lineColor}
                shape={lineBadgeShape(leg.lineType)}
              />
            </span>
          ) : (
            <div className={styles.dot} style={{ background: leg.lineColor }} />
          )}
          <span className={styles.title}>{leg.lineName}</span>
        </div>
        <span className={styles.meta}>
          {t('legMeta', { count: leg.stationIds.length - 1, minutes: leg.minutes })}
        </span>
      </div>

      <VerticalTimelineList
        items={timelineItems}
        color={leg.lineColor}
        variant={leg.lineType ? LINE_VARIANT[leg.lineType] : 'single'}
      />
    </div>
  )
})

RouteLeg.displayName = 'RouteLeg'
