import type { Line } from '@/types/metro'

export interface EditLineFormProps {
  line: Line
  onClose: () => void
  reloadData: () => Promise<void>
}
