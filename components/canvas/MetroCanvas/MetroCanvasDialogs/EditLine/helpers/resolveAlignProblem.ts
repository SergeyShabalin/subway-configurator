import type { AlignProblem } from '../types'

export const resolveAlignProblem = (
  startId: string,
  endId: string,
  pathLength: number
): AlignProblem => {
  const hasSelection = Boolean(startId && endId)

  if (hasSelection && startId === endId) return 'sameStation'
  if (hasSelection && pathLength < 3) return 'noBetween'
  return null
}
