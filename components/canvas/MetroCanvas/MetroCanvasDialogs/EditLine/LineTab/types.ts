import type { Line } from '@/types/metro'

export interface LineTabProps {
  line: Line
  onClose: () => void
  reloadData: () => Promise<void>
}
