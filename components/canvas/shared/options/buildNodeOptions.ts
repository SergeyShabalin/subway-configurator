import type { DropdownOption } from '@/components/ui/Dropdown'
import type { Line, Station } from '@/types/metro'
import { lineMarker } from './optionMarkers'

/** Опция узла (визуала) с метаданными для фильтрации на стороне потребителя. */
export interface NodeOption extends DropdownOption<string> {
  lineIds: Array<string>
}

interface Input {
  stations: ReadonlyArray<Station>
  lines: ReadonlyArray<Line>
  visualToStations: Record<string, Array<string>>
}

/** value: id визуала, label: название станции, leading: значки всех линий узла. */
export const buildNodeOptions = ({
  stations,
  lines,
  visualToStations,
}: Input): Array<NodeOption> => {
  const stationById = new Map(stations.map((s) => [s.id, s]))
  const lineById = new Map(lines.map((l) => [l.id, l]))
  const result: Array<NodeOption> = []

  for (const [visualId, stationIds] of Object.entries(visualToStations)) {
    const nodeStations = stationIds
      .map((id) => stationById.get(id))
      .filter((s): s is Station => s !== undefined)
    if (nodeStations.length === 0) continue

    const nodeLines = new Map<string, Line>()
    for (const station of nodeStations) {
      const line = lineById.get(station.line_id)
      if (line) nodeLines.set(line.id, line)
    }
    const nodeLineList = [...nodeLines.values()]

    result.push({
      value: visualId,
      label: nodeStations[0].name,
      lineIds: nodeLineList.map((l) => l.id),
      leading: lineMarker(nodeLineList),
    })
  }

  return result.sort((a, b) => a.label.localeCompare(b.label))
}
