import type { SelectedSegmentData } from '../types'

export interface EditSegmentFormProps {
  segment: SelectedSegmentData
  onSave: (timeMinutes: number) => Promise<void>
  onClose: () => void
}
