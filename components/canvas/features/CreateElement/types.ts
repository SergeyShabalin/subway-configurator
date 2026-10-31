import type { InsertPosition } from '@/types/metro'

export interface AddElementProps {
  isOpen: boolean
  position: { x: number; y: number }
  onClose: () => void
  reloadData: () => Promise<void>
}

export interface CreateStationPayload {
  name: string
  lineId: string
  x: number
  y: number
  transferToVisualId?: string
  timeMinutes: number
  insertPosition: InsertPosition
}

export interface CreateLinePayload {
  name: string
  color: string
}

export interface TransferNode {
  visualId: string
  name: string
  lineIds: Array<string>
  colors: Array<string>
}
