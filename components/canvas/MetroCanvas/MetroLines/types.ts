import type Konva from 'konva'
import type { MutableRefObject } from 'react'

export interface MetroLinesProps {
  visuals: Record<string, { x: number; y: number }>
  lineRef: MutableRefObject<Record<string, Konva.Line>>
}
