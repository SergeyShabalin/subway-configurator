import type { Line, Station } from '@/types/metro'
import type { TransferNode } from '../types'

export const buildTransferNodes = (
  stations: ReadonlyArray<Station>,
  lines: ReadonlyArray<Line>,
  visualToStations: Readonly<Record<string, ReadonlyArray<string>>>
): Array<TransferNode> => {
  const stationById = new Map(stations.map((s) => [s.id, s]))
  const lineById = new Map(lines.map((l) => [String(l.id), l]))

  const nodes: Array<TransferNode> = []

  for (const [visualId, stationIds] of Object.entries(visualToStations)) {
    const nodeStations = stationIds.flatMap((id) => {
      const station = stationById.get(id)
      return station ? [station] : []
    })

    if (nodeStations.length === 0) continue

    const nodeLines = new Map<string, Line>()
    for (const station of nodeStations) {
      const line = lineById.get(String(station.line_id))
      if (line) nodeLines.set(line.id, line)
    }
    const lineList = [...nodeLines.values()]

    nodes.push({
      visualId,
      name: nodeStations[0].name,
      lineIds: nodeStations.map((s) => String(s.line_id)),
      colors: lineList.map((l) => l.color),
      lines: lineList,
    })
  }

  return nodes.sort((a, b) => a.name.localeCompare(b.name))
}
