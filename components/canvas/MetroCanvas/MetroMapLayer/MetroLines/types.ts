import type { VisualStation } from '@/types/metro'
import type Konva from 'konva'

export interface SelectedSegment {
  lineId: string
  fromVisualId: string
  toVisualId: string
}

export interface MetroLinesProps {
  visuals: Record<string, VisualStation>
  lineRef: React.MutableRefObject<Record<string, Konva.Line>>
  onSegmentClick?: (segment: SelectedSegment) => void
}
