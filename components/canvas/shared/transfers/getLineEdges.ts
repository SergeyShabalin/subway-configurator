import type { InsertPosition } from '@/types/metro'

interface LineLike {
  id: string | number
  logicalStationIds?: Array<string> | null
}

export interface LineEdge {
  lineId: string
  /** start: станция первая на линии, end: последняя */
  insertPosition: InsertPosition
}

/** Линии, на которых хотя бы одна из станций узла стоит первой или последней */
export const getLineEdges = (
  stationIds: ReadonlyArray<string>,
  lines: ReadonlyArray<LineLike>
): Array<LineEdge> => {
  const edges: Array<LineEdge> = []

  for (const line of lines) {
    const ids = line.logicalStationIds ?? []
    if (ids.length === 0) continue

    // Для линии из одной станции она и первая, и последняя: берём 'end'
    if (stationIds.includes(ids[ids.length - 1])) {
      edges.push({ lineId: String(line.id), insertPosition: 'end' })
    } else if (stationIds.includes(ids[0])) {
      edges.push({ lineId: String(line.id), insertPosition: 'start' })
    }
  }

  return edges
}
