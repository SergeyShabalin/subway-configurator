import {
  CreateStationPayload,
  TransferNode,
} from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/CreateElement/types'
import { DropdownOption } from '@/components/ui/Dropdown'

export interface CreateStationFormProps {
  position: { x: number; y: number }
  lineOptions: Array<DropdownOption<string>>
  transferNodes: Array<TransferNode>
  onSubmit: (data: CreateStationPayload) => Promise<void>
  onSuccess?: () => void
  onCancel?: () => void
  onLoadingChange?: (isLoading: boolean) => void
}
