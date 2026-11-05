import type { QueryExpander } from './types'

const EN = "`qwertyuiop[]asdfghjkl;'zxcvbnm,./"
const RU = 'ёйцукенгшщзхъфывапролджэячсмитьбю.'

const buildMap = (from: string, to: string) =>
  new Map([...from].map((char, i) => [char, to[i]] as const))

const enToRu = buildMap(EN, RU)
const ruToEn = buildMap(RU, EN)

const convert = (text: string, map: Map<string, string>) =>
  [...text].map((char) => map.get(char) ?? char).join('')

export const identityExpander: QueryExpander = {
  expand: (query) => [query],
}

/** «ghbdtn» → «привет», «руддщ» → «hello». */
export const layoutExpander: QueryExpander = {
  expand(query) {
    const lower = query.toLowerCase() // до normalize, чтобы не потерять «ё» (клавиша `)
    return [convert(lower, enToRu), convert(lower, ruToEn)]
  },
}
