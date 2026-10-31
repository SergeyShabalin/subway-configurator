import type { RouteResult as RouteResultType } from '../../types'
import { RouteLeg } from '../RouteLeg/RouteLeg'
import { RouteTransfer } from '../RouteTransfer/RouteTransfer'
import styles from './RouteTimeline.module.css'

interface RouteTimelineProps {
  legs: RouteResultType['legs']
}

export const RouteTimeline = ({ legs }: RouteTimelineProps) => {
  if (legs.length === 0) return null

  return (
    <div className={styles.timeline}>
      {legs.map((leg, index) => {
        const prevLeg = index > 0 ? legs[index - 1] : null

        const fromStation = prevLeg ? prevLeg.stationNames[prevLeg.stationNames.length - 1] : ''
        const toStation = leg.stationNames[0]

        return (
          <div key={`${leg.lineId}-${index}`} className={styles.segment}>
            {index > 0 && prevLeg && (
              <RouteTransfer
                fromStation={fromStation}
                toStation={toStation}
                fromColor={prevLeg.lineColor}
                toColor={leg.lineColor}
                minutes={leg.transferMinutesBefore}
              />
            )}

            <RouteLeg leg={leg} />
          </div>
        )
      })}
    </div>
  )
}
