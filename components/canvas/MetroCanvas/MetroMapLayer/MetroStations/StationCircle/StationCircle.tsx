'use client'

import { resolveStationStyle } from '@/src/lib/styles/stationStyle'
import { memo } from 'react'
import { Circle, Rect } from 'react-konva'
import type { StationCircleProps } from '../types'
import { areStationCirclePropsEqual } from './helpers/areStationCirclePropsEqual'
import { useStationCircleStyle } from './hooks/useStationCircleStyle'
import { useStationHitArea } from './hooks/useStationHitArea'
import { useStationInteraction } from './hooks/useStationInteraction'

export const StationCircle = memo(
  ({
    visual,
    appearance,
    stationId,
    isDimmed = false,
    stationStyle,
    handlers,
  }: StationCircleProps) => {
    const style = resolveStationStyle(stationStyle)

    const { isHovered, interactiveProps } = useStationInteraction({
      visual,
      stationId,
      handlers,
      isLocked: isDimmed,
    })
    const { radius, fill, strokeProps, shadowProps } = useStationCircleStyle({
      appearance,
      isDimmed,
      isHovered,
      style,
    })
    const hitFunc = useStationHitArea(style.isSquare)

    if (!visual) return null

    const shapeProps = {
      x: visual.x ?? 0,
      y: visual.y ?? 0,
      fill,
      hitFunc,
      ...strokeProps,
      ...shadowProps,
      ...interactiveProps,
    }

    // offset = половина стороны: x()/y() остаются центром, как у круга, и drag работает без правок
    return style.isSquare ? (
      <Rect
        {...shapeProps}
        width={radius * 2}
        height={radius * 2}
        offsetX={radius}
        offsetY={radius}
      />
    ) : (
      <Circle {...shapeProps} radius={radius} />
    )
  },
  areStationCirclePropsEqual
)

StationCircle.displayName = 'StationCircle'
