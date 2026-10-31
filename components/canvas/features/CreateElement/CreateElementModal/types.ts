import {
  CreateLinePayload,
  CreateStationPayload,
  TransferNode,
} from '@/components/canvas/features/CreateElement/types'
import { DropdownOption } from '@/components/ui/Dropdown'

export type TabType = 'station' | 'line'

export interface AddElementModalProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  initialTab?: TabType
  lineOptions: Array<DropdownOption<string>>
  transferNodes: Array<TransferNode>
  onCreateStation: (data: CreateStationPayload) => Promise<void>
  onCreateLine: (data: CreateLinePayload) => Promise<void>
}
