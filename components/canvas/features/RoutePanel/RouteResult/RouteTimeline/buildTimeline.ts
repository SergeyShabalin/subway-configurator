import { RouteAccess } from '@/src/lib/routing/types'
import type { RouteLeg, RouteResult } from '../../types'
import type { RouteEndpoint, TimelineEntry, TransferData } from './types'

const accessTransfer = (access: RouteAccess): TransferData => ({
  from: {
    station: access.fromStationName,
    color: access.fromLineColor,
    badge: access.fromLineBadge,
    type: access.fromLineType,
  },
  to: {
    station: access.toStationName,
    color: access.toLineColor,
    badge: access.toLineBadge,
    type: access.toLineType,
  },
  minutes: access.minutes,
})

const legEndpoint = (leg: RouteLeg, station: string): RouteEndpoint => ({
  station,
  color: leg.lineColor,
  badge: leg.lineBadge,
  type: leg.lineType,
})

const transferBetween = (prev: RouteLeg, leg: RouteLeg): TransferData => ({
  from: legEndpoint(prev, prev.stationNames[prev.stationNames.length - 1]),
  to: legEndpoint(leg, leg.stationNames[0]),
  minutes: leg.transferMinutesBefore,
})

/** Плоская модель таймлайна: считается один раз на маршрут, компоненты только рисуют. */
export const buildTimeline = ({
  legs,
  startAccess,
  endAccess,
}: Pick<RouteResult, 'legs' | 'startAccess' | 'endAccess'>): Array<TimelineEntry> => {
  const entries: Array<TimelineEntry> = []

  if (startAccess) {
    entries.push({ kind: 'access', key: 'access-start', transfer: accessTransfer(startAccess) })
  }

  legs.forEach((leg, index) => {
    const prev = index > 0 ? legs[index - 1] : null

    entries.push({
      kind: 'leg',
      key: `leg-${leg.lineId}-${index}`,
      leg,
      transferBefore: prev && leg.transferMinutesBefore > 0 ? transferBetween(prev, leg) : null,
    })
  })

  if (endAccess) {
    entries.push({ kind: 'access', key: 'access-end', transfer: accessTransfer(endAccess) })
  }

  return entries
}
