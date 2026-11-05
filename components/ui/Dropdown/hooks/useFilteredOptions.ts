import { useMemo } from 'react'
import { defaultOptionSearcher } from '../search/createOptionSearcher'
import type { OptionSearcher } from '../search/types'

export const useFilteredOptions = <T extends { label: string }>(
  options: Array<T>,
  query: string,
  searcher: OptionSearcher = defaultOptionSearcher
): Array<T> => useMemo(() => searcher.search(options, query), [options, query, searcher])
