export type RouteStatus = 'idle' | 'sameStation' | 'notFound' | 'found'

interface Params {
  fromId: string
  toId: string
  viaIds: ReadonlyArray<string>
  hasRoute: boolean
}

export const resolveRouteStatus = ({ fromId, toId, viaIds, hasRoute }: Params): RouteStatus => {
  if (!fromId || !toId) return 'idle'
  if (!viaIds.every(Boolean)) return 'idle'

  const sameAdjacent = [fromId, ...viaIds, toId].some(
    (id, i, arr) => i > 0 && Boolean(id) && id === arr[i - 1]
  )
  if (sameAdjacent) return 'sameStation'

  return hasRoute ? 'found' : 'notFound'
}
