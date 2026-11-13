import { createLineLookup } from '@/components/canvas/shared/options/lineLookup'
import type { Line, Station } from '@/types/metro'
import type { TransferNode } from '../types'

export const buildTransferNodes = (
  stations: ReadonlyArray<Station>,
  lines: ReadonlyArray<Line>,
  visualToStations: Readonly<Record<string, ReadonlyArray<string>>>
): Array<TransferNode> => {
  const stationById = new Map(stations.map((s) => [s.id, s]))
  const { getNodeLines } = createLineLookup(stations, lines)

  const nodes: Array<TransferNode> = []

  for (const [visualId, stationIds] of Object.entries(visualToStations)) {
    const nodeStations = stationIds.flatMap((id) => {
      const station = stationById.get(id)
      return station ? [station] : []
    })

    if (nodeStations.length === 0) continue

    const nodeLines = getNodeLines(nodeStations.map((s) => s.id))

    nodes.push({
      visualId,
      name: nodeStations[0].name,
      lineIds: nodeStations.map((s) => String(s.line_id)),
      colors: nodeLines.map((l) => l.color),
      lines: nodeLines,
    })
  }

  return nodes.sort((a, b) => a.name.localeCompare(b.name))
}
