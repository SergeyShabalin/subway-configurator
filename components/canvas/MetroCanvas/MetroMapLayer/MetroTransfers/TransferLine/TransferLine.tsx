import type Konva from 'konva'
import { Fragment } from 'react'
import { Line } from 'react-konva'

import { CANVAS_DIMMED_COLOR } from '@/components/canvas/shared/dimmedColors'

import { CANVAS_HOVER_COLOR, CANVAS_TRANSFER_OUTLINE } from '@/components/canvas/shared/themeColors'

import { useTheme } from '@/context/theme-context'
import type { VisualStation } from '@/types/metro'

import { DASH_PATTERN, FALLBACK_COLOR } from '../constants'
import { getTransferGradient } from '../utils/getTransferGradient'
import { getTransferStyle } from '../utils/getTransferStyle'

interface TransferLineProps {
  id: string
  from: VisualStation
  to: VisualStation
  fromColor: string
  toColor: string
  hovered: boolean
  dimmed: boolean
  style?: string
  onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void
  onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onClick: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, id: string) => void
}

export const TransferLine = ({
  id,
  from,
  to,
  fromColor,
  toColor,
  hovered,
  dimmed,
  style,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: TransferLineProps) => {
  const { theme } = useTheme()

  const points = [from.x, from.y, to.x, to.y]
  const dash = DASH_PATTERN[getTransferStyle(style)]

  const outlineColor = CANVAS_TRANSFER_OUTLINE[theme]
  const hoverColor = CANVAS_HOVER_COLOR[theme]
  const dimmedColor = CANVAS_DIMMED_COLOR[theme]

  const gradientProps =
    hovered || dimmed
      ? {}
      : {
          strokeLinearGradientStartPoint: { x: from.x, y: from.y },
          strokeLinearGradientEndPoint: { x: to.x, y: to.y },
          strokeLinearGradientColorStops: getTransferGradient(
            fromColor || FALLBACK_COLOR,
            toColor || FALLBACK_COLOR
          ),
        }

  const interactionProps = dimmed
    ? { listening: false as const }
    : {
        listening: true as const,
        onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => onMouseEnter(e, id),
        onMouseLeave,
        onClick: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => onClick(e, id),
        onTap: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => onClick(e, id),
      }

  return (
    <Fragment>
      <Line
        points={points}
        stroke={outlineColor}
        strokeWidth={5}
        dash={dash}
        opacity={0.8}
        lineCap="round"
        listening={false}
      />

      <Line
        points={points}
        stroke={hovered ? hoverColor : dimmed ? dimmedColor : undefined}
        strokeWidth={3}
        dash={dash}
        opacity={0.95}
        lineCap="round"
        hitStrokeWidth={20}
        {...gradientProps}
        {...interactionProps}
      />
    </Fragment>
  )
}
