/** Оценивает, насколько target подходит под query. 0 = не подходит. */
export interface MatchStrategy {
  score(query: string, target: string): number
}

/** Порождает дополнительные варианты запроса (раскладка, транслит и т.д.). */
export interface QueryExpander {
  expand(query: string): Array<string>
}

export interface OptionSearcher {
  search<T extends { label: string }>(items: Array<T>, query: string): Array<T>
}
