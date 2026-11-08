import { VerticalTimelineList } from '@/components/ui'
import { LineBadgeIcon } from '@/components/ui/LineBadgeIcon/LineBadgeIcon'
import type { TimelineItem, TimelineLineVariant } from '@/components/ui/VerticalTimelineList/types'
import { useMetroStore } from '@/store'
import type { Line } from '@/types/metro'
import { useTranslations } from 'next-intl'
import type { RouteResult } from '../../types'
import styles from './RouteLeg.module.css'

interface RouteLegProps {
  leg: RouteResult['legs'][0]
}

const LINE_VARIANT: Partial<Record<Line['type'], TimelineLineVariant>> = {
  commuter_rail: 'double',
}

export const RouteLeg = ({ leg }: RouteLegProps) => {
  const t = useTranslations('RoutePanel')

  // Объект линии стабилен между обновлениями стора, лишних перерисовок не будет
  const line = useMetroStore((state) => state.lines.find((l) => l.id === leg.lineId))

  const timelineItems: Array<TimelineItem> = leg.stationNames.map((name, i) => ({
    id: `${leg.stationIds[i]}-${i}`,
    label: name,
  }))

  const isRail = line?.type === 'commuter_rail'

  return (
    <div className={styles.leg}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          {line?.lineBadge ? (
            <span className={styles.badge}>
              <LineBadgeIcon
                text={line.lineBadge}
                color={leg.lineColor}
                shape={isRail ? 'parallelogram' : 'circle'}
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
        variant={(line?.type && LINE_VARIANT[line.type]) ?? 'single'}
      />
    </div>
  )
}
