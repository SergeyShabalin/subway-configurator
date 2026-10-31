'use client'

import { useRoute } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { CANVAS_DIMMED_COLOR } from '@/components/canvas/shared/dimmedColors'
import {
  CANVAS_LABEL_FILL,
  CANVAS_LABEL_FONT_STYLE,
  CANVAS_LABEL_HOVER_FILL,
  CANVAS_LABEL_STROKE,
} from '@/components/canvas/shared/themeColors'
import { useTheme } from '@/context/theme-context'
import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { Golos_Text } from 'next/font/google'
import { useCallback, useEffect, useState } from 'react'
import { Text } from 'react-konva'
import { useMetroLabels } from './hooks/useMetroLabels'
import type { MetroLabelsProps } from './types'

const labelFont = Golos_Text({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
})

const LABEL_FONT_FAMILY = labelFont.style.fontFamily
const LABEL_FONT_SIZE = 14
const LABEL_WIDTH = 60

const useLabelFontReady = (): boolean => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let isCancelled = false
    Promise.all([
      document.fonts.load(`400 ${LABEL_FONT_SIZE}px ${LABEL_FONT_FAMILY}`, 'Аa'),
      document.fonts.load(`700 ${LABEL_FONT_SIZE}px ${LABEL_FONT_FAMILY}`, 'Аa'),
    ])
      .catch(() => undefined)
      .finally(() => {
        if (!isCancelled) setIsReady(true)
      })
    return () => {
      isCancelled = true
    }
  }, [])

  return isReady
}

export const MetroLabels = ({ stationNames, textRef, onLabelMove }: MetroLabelsProps) => {
  const { theme } = useTheme()
  const visuals = useMetroStore((state) => state.visuals)
  const routeVisualIds = useRoute()?.visualIds

  const isFontReady = useLabelFontReady()
  const { labelData } = useMetroLabels(visuals, stationNames)

  const [hoveredLabelId, setHoveredLabelId] = useState<string | null>(null)

  const labelFill = CANVAS_LABEL_FILL[theme]
  const labelHoverFill = CANVAS_LABEL_HOVER_FILL[theme]
  const labelStroke = CANVAS_LABEL_STROKE[theme]
  const labelFontStyle = CANVAS_LABEL_FONT_STYLE[theme]
  const dimmedColor = CANVAS_DIMMED_COLOR[theme]

  const handleMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
    const stage = e.target.getStage()
    if (stage) stage.container().style.cursor = 'pointer'
    setHoveredLabelId(id)
  }, [])

  const handleMouseLeave = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (stage) stage.container().style.cursor = 'default'
    setHoveredLabelId(null)
  }, [])

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, visualId: string) => {
      onLabelMove(visualId, e.target.x(), e.target.y())
    },
    [onLabelMove]
  )

  if (!isFontReady) return null

  return (
    <>
      {labelData.map((label) => {
        const isHovered = hoveredLabelId === label.id
        const isDimmed = routeVisualIds ? !routeVisualIds.has(label.id) : false

        const currentFill =
          isHovered && !isDimmed ? labelHoverFill : isDimmed ? dimmedColor : labelFill
        const currentStroke = isDimmed && !isHovered ? 'transparent' : labelStroke

        const interactiveProps = isDimmed
          ? { listening: false }
          : {
              draggable: true,
              onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) =>
                handleMouseEnter(e, label.id),
              onMouseLeave: handleMouseLeave,
              onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(e, label.id),
              onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
                e.cancelBubble = true
              },
            }

        return (
          <Text
            key={`label-${label.id}`}
            ref={(node) => {
              if (node) textRef.current[label.id] = node
            }}
            x={label.x}
            y={label.y}
            offsetX={LABEL_WIDTH / 2}
            text={label.text}
            fontSize={LABEL_FONT_SIZE}
            fontFamily={LABEL_FONT_FAMILY}
            fontStyle={labelFontStyle}
            fill={currentFill}
            align="center"
            verticalAlign="middle"
            stroke={currentStroke}
            strokeWidth={0.3}
            {...interactiveProps}
          />
        )
      })}
    </>
  )
}
