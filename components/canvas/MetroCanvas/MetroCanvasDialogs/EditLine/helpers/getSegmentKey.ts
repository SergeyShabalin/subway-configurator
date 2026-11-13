import type { SelectedSegment } from '@/components/canvas/MetroCanvas/MetroMapLayer/MetroLines/types'

export const getSegmentKey = (selectedSegment: SelectedSegment | null): string =>
  selectedSegment
    ? `${selectedSegment.lineId}-${selectedSegment.fromVisualId}-${selectedSegment.toVisualId}`
    : 'empty'
