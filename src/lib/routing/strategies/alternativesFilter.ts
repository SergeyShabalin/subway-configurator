import {
  EXTRA_TIME_RATIO,
  MAX_ROUTE_ALTERNATIVES,
  MAX_SHARED_RATIO,
  MIN_EXTRA_MINUTES,
} from '../constants'
import { sharedRatio } from '../paths/signature'

interface Weighted<T> {
  item: T
  minutes: number
  signature: Set<string>
}

/**
 * Отбирает до `limit` вариантов, начиная с самого быстрого, пропуская слишком похожие
 * и слишком медленные. Инвариант: варианты идут по возрастанию времени.
 */
export const pickDistinctAlternatives = <T>(
  candidates: ReadonlyArray<Weighted<T>>,
  limit: number = MAX_ROUTE_ALTERNATIVES
): Array<T> => {
  if (candidates.length === 0) return []

  const best = candidates[0]
  const maxMinutes = best.minutes + Math.max(MIN_EXTRA_MINUTES, best.minutes * EXTRA_TIME_RATIO)

  const selected: Array<Weighted<T>> = [best]

  for (const candidate of candidates.slice(1)) {
    if (selected.length >= limit || candidate.minutes > maxMinutes) break

    const isDistinct = selected.every(
      (item) => sharedRatio(candidate.signature, item.signature) <= MAX_SHARED_RATIO
    )

    if (isDistinct) selected.push(candidate)
  }

  return selected.map((item) => item.item)
}
