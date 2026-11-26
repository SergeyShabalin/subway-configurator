import type Konva from 'konva'
import { useCallback } from 'react'
import type { MetroLinesProps } from '../types'

/** Стабильный callback-ref: без useCallback Konva-узел перерегистрировался бы на каждый рендер. */
export const useRegisterRef = (
  lineRef: MetroLinesProps['lineRef'],
  segmentKey: string,
  suffix: string
) =>
  useCallback(
    (node: Konva.Path | null) => {
      if (node) lineRef.current[`${segmentKey}${suffix}`] = node as unknown as Konva.Line
    },
    [lineRef, segmentKey, suffix]
  )
