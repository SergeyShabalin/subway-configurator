import type { LineType } from '@/types/metro'
import type { RouteLeg } from '../../types'

export interface RouteEndpoint {
  station: string
  color?: string
  badge?: string
  type?: LineType
}

export interface TransferData {
  from: RouteEndpoint
  to: RouteEndpoint
  minutes: number
}

export type TimelineEntry =
  | { kind: 'access'; key: string; transfer: TransferData }
  | { kind: 'leg'; key: string; leg: RouteLeg; transferBefore: TransferData | null }
