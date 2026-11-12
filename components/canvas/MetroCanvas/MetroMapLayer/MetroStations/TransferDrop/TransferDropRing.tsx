import { memo } from 'react'
import { Circle } from 'react-konva'
import { RING_COLOR_ARMED, RING_COLOR_IDLE, RING_RADIUS } from './constants'

interface DropTargetRingProps {
  x: number
  y: number
  armed: boolean
}

export const TransferDropRing = memo(({ x, y, armed }: DropTargetRingProps) => (
  <Circle
    x={x}
    y={y}
    radius={RING_RADIUS}
    stroke={armed ? RING_COLOR_ARMED : RING_COLOR_IDLE}
    strokeWidth={5}
    dash={armed ? [] : [6, 4]}
    listening={false}
  />
))

TransferDropRing.displayName = 'TransferDropRing'
