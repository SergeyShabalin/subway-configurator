interface Point {
  x: number
  y: number
}

interface Candidate extends Point {
  id: string
}

export const findDropTarget = (
  point: Point,
  candidates: ReadonlyArray<Candidate>,
  hitDistance: number
): string | null => {
  let nearestId: string | null = null
  let nearestDistance = hitDistance

  for (const c of candidates) {
    const distance = Math.hypot(c.x - point.x, c.y - point.y)
    if (distance <= nearestDistance) {
      nearestDistance = distance
      nearestId = c.id
    }
  }

  return nearestId
}
