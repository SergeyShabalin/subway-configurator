'use client'

import { memo } from 'react'
import { Circle } from 'react-konva'
import type { StationCircleProps } from '../types'
import { areStationCirclePropsEqual } from './helpers/areStationCirclePropsEqual'
import { useStationCircleStyle } from './hooks/useStationCircleStyle'
import { useStationHitArea } from './hooks/useStationHitArea'
import { useStationInteraction } from './hooks/useStationInteraction'

export const StationCircle = memo(
  ({ visual, appearance, stationId, isDimmed = false, handlers }: StationCircleProps) => {
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
    })
    const hitFunc = useStationHitArea()

    if (!visual) return null

    return (
      <Circle
        x={visual.x ?? 0}
        y={visual.y ?? 0}
        radius={radius}
        fill={fill}
        hitFunc={hitFunc}
        {...strokeProps}
        {...shadowProps}
        {...interactiveProps}
      />
    )
  },
  areStationCirclePropsEqual
)

StationCircle.displayName = 'StationCircle'
