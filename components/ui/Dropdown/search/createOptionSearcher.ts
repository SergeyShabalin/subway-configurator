import { identityExpander, layoutExpander } from './expanders'
import { normalize } from './normalize'
import { fuzzyStrategy, substringStrategy } from './strategies'
import type { MatchStrategy, OptionSearcher, QueryExpander } from './types'

interface Config {
  strategies: Array<MatchStrategy>
  expanders: Array<QueryExpander>
}

export const createOptionSearcher = ({ strategies, expanders }: Config): OptionSearcher => ({
  search(items, query) {
    if (!normalize(query)) return items

    const variants = [
      ...new Set(
        expanders
          .flatMap((e) => e.expand(query))
          .map(normalize)
          .filter(Boolean)
      ),
    ]

    return items
      .map((item, index) => {
        const target = normalize(item.label)
        const score = Math.max(
          0,
          ...variants.flatMap((variant) => strategies.map((s) => s.score(variant, target)))
        )
        return { item, index, score }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index) // при равенстве сохраняем исходный порядок
      .map((r) => r.item)
  },
})

export const defaultOptionSearcher = createOptionSearcher({
  strategies: [substringStrategy, fuzzyStrategy],
  expanders: [identityExpander, layoutExpander],
})
