import type { VisualStation } from '@/store'
import type Konva from 'konva'
import { Dispatch, MutableRefObject, SetStateAction } from 'react'

export interface MetroStationsProps {
  visuals: Record<string, VisualStation>
  circleRef: MutableRefObject<Record<string, Konva.Circle>>
  lineRef: MutableRefObject<Record<string, Konva.Line>>
  textRef: MutableRefObject<Record<string, Konva.Text>>
  setVisuals: Dispatch<SetStateAction<Record<string, VisualStation>>>
}
