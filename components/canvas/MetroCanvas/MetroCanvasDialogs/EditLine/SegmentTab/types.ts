import type { SelectedSegmentData } from '../types'

export interface SegmentTabProps {
  segment: SelectedSegmentData
  onSave: (timeMinutes: number) => Promise<void>
  onClose: () => void
}
