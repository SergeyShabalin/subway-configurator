import { MAX_VIA_COMBINATIONS } from '../constants'

/**
 * Декартово произведение вариантов отрезков с ограничением на итоговое число комбинаций.
 * Порядок сохраняется: сначала лучшие варианты первого отрезка, затем — следующие.
 */
export const buildCombinations = <T>(
  perLeg: ReadonlyArray<ReadonlyArray<T>>,
  limit: number = MAX_VIA_COMBINATIONS
): Array<Array<T>> => {
  let combos: Array<Array<T>> = [[]]

  for (const options of perLeg) {
    const next: Array<Array<T>> = []
    for (const combo of combos) {
      for (const option of options) {
        next.push([...combo, option])
        if (next.length >= limit) break
      }
      if (next.length >= limit) break
    }
    combos = next
  }

  return combos
}
