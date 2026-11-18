import { useSelectedSegmentData } from '@/components/canvas/MetroCanvas/hooks/useSelectedSegmentData'

export type EditLineTab = 'segment' | 'line' | 'stations'

export interface EditLineTabItem {
  value: EditLineTab
  label: string
}

export type SelectedSegmentData = NonNullable<ReturnType<typeof useSelectedSegmentData>>
