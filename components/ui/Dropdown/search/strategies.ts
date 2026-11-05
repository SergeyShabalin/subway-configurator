import { damerauLevenshtein } from './damerauLevenshtein'
import { tokenize } from './normalize'
import type { MatchStrategy } from './types'

/** Точное / префиксное / вхождение. */
export const substringStrategy: MatchStrategy = {
  score(query, target) {
    if (!query) return 0
    if (target === query) return 100
    if (target.startsWith(query)) return 90
    if (tokenize(target).some((word) => word.startsWith(query))) return 80
    if (target.includes(query)) return 60
    return 0
  },
}

/** Допустимое число опечаток зависит от длины слова. */
const maxTypos = (length: number): number => (length < 4 ? 0 : length < 7 ? 1 : 2)

const bestDistance = (queryToken: string, targetTokens: Array<string>): number =>
  Math.min(
    ...targetTokens.map((token) =>
      Math.min(
        damerauLevenshtein(queryToken, token),
        // сравнение с префиксом, чтобы частично введённое слово с опечаткой тоже находилось
        damerauLevenshtein(queryToken, token.slice(0, queryToken.length))
      )
    )
  )

/** Поиск с опечатками. Каждое слово запроса должно найти пару в target. */
export const fuzzyStrategy: MatchStrategy = {
  score(query, target) {
    const queryTokens = tokenize(query)
    const targetTokens = tokenize(target)
    if (queryTokens.length === 0 || targetTokens.length === 0) return 0

    let totalDistance = 0
    for (const token of queryTokens) {
      const distance = bestDistance(token, targetTokens)
      if (distance > maxTypos(token.length)) return 0
      totalDistance += distance
    }

    return Math.max(1, 50 - (totalDistance / queryTokens.length) * 15)
  },
}
