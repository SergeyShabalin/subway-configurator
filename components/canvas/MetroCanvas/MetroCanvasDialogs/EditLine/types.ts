import { useSelectedSegmentData } from '@/components/canvas/MetroCanvas/hooks/useSelectedSegmentData'

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
