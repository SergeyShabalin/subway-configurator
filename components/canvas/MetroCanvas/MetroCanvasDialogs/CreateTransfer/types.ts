export interface CreateTransferModalProps {
  isOpen: boolean
  fromVisualId: string
  /** Предвыбранная целевая станция (например, при перетаскивании станции на станцию) */
  initialToVisualId?: string
  existingTransferIds: Array<string>
  onCancel: () => void
  onSuccess?: () => Promise<void>
}
