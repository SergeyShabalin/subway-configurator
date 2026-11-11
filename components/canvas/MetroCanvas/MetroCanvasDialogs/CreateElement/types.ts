import type { InsertPosition, Line, LineType } from '@/types/metro'

export interface CreateElementProps {
  isOpen: boolean
  position: { x: number; y: number }
  /** Предвыбранная линия (вкладка станции) */
  initialLineId?: string
  /** Предвыбранная позиция вставки (вкладка станции) */
  initialInsertPosition?: InsertPosition
  /** Предвыбранный узел для пересадки (вкладка станции) */
  initialTransferVisualId?: string
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
  type?: LineType
  lineBadge: string
}

export interface TransferNode {
  visualId: string
  name: string
  lineIds: Array<string>
  colors: Array<string>
  lines: Array<Line>
}
