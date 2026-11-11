import type {
  CreateLinePayload,
  CreateStationPayload,
  TransferNode,
} from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/CreateElement/types'
import type { DropdownOption } from '@/components/ui/Dropdown'
import type { InsertPosition } from '@/types/metro'

export type TabType = 'station' | 'line'

export interface CreateElementModalProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  initialTab?: TabType
  initialLineId?: string
  initialInsertPosition?: InsertPosition
  initialTransferVisualId?: string
  lineOptions: Array<DropdownOption<string>>
  transferNodes: Array<TransferNode>
  onCreateStation: (data: CreateStationPayload) => Promise<void>
  onCreateLine: (data: CreateLinePayload) => Promise<void>
}
