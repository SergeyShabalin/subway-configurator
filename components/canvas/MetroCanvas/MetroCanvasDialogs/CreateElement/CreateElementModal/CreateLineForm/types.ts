import type { CreateLinePayload } from '../../types'

export interface CreateLineFormProps {
  onSubmit: (data: CreateLinePayload) => Promise<void>
  onSuccess?: () => void
  onCancel?: () => void
  onLoadingChange?: (isLoading: boolean) => void
}
