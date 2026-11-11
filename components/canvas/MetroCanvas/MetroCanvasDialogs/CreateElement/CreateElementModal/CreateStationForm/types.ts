import type { DropdownOption } from '@/components/ui/Dropdown'
import type { CreateStationPayload, TransferNode } from '../../types'

export interface CreateStationFormProps {
  position: { x: number; y: number }
  lineOptions: Array<DropdownOption<string>>
  transferNodes?: Array<TransferNode>
  initialLineId?: string
  initialInsertPosition?: CreateStationPayload['insertPosition']
  initialTransferVisualId?: string
  onSubmit: (data: CreateStationPayload) => Promise<void>
  onSuccess?: () => void
  onCancel?: () => void
  onLoadingChange?: (isLoading: boolean) => void
}
