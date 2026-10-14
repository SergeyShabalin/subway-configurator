import type { VisualStation } from '@/store'
import type Konva from 'konva'
import type { MutableRefObject } from 'react'

export interface MetroLabelsProps {
  visuals: Record<string, VisualStation>
  stationNames: Record<string, string>
  textRef: MutableRefObject<Record<string, Konva.Text>>
}
