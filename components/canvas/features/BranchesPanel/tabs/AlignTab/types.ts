import type { PositionedVisual } from '@/src/lib/layout/alignStations'

export type AlignStatus = 'idle' | 'done' | 'error'
export type AlignProblem = 'sameStation' | 'noBetween' | null

export interface Alignment {
  before: Array<PositionedVisual>
  after: Array<PositionedVisual>
}
