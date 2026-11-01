import type { RawPath, RouteResult } from '../types'

/** Набор перегонов маршрута без направления: для сравнения похожести вариантов. */
export const rideSignature = (path: RawPath): Set<string> => {
  const signature = new Set<string>()

  path.edges.forEach((edge, i) => {
    if (edge.kind !== 'ride') return

    const [a, b] = [path.nodes[i], path.nodes[i + 1]].sort()
    signature.add(`${edge.lineId}:${a}:${b}`)
  })

  return signature
}

/** Подпись готового маршрута по его сегментам. */
export const routeSignature = (route: RouteResult): Set<string> => route.segmentKeys

/** Доля общих элементов, нормированная на меньший набор. */
export const sharedRatio = (a: Set<string>, b: Set<string>): number => {
  const smallest = Math.min(a.size, b.size)
  if (smallest === 0) return a.size === b.size ? 1 : 0

  let shared = 0
  for (const key of a) {
    if (b.has(key)) shared++
  }

  return shared / smallest
}
