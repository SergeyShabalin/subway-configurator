import { useSelectedSegmentData } from '@/components/canvas/MetroCanvas/hooks/useSelectedSegmentData'
import type { PositionedVisual } from '@/src/lib/layout/alignStations'

export type EditLineTab = 'segment' | 'line' | 'stations' | 'align'

export interface EditLineTabItem {
  value: EditLineTab
  label: string
}

export interface LineStationItem {
  id: string
  name: string
}

export type SelectedSegmentData = NonNullable<ReturnType<typeof useSelectedSegmentData>>

export type AlignStatus = 'idle' | 'done' | 'error'
export type AlignProblem = 'sameStation' | 'noBetween' | null

export interface Alignment {
  before: Array<PositionedVisual>
  after: Array<PositionedVisual>
}
