import type { DropdownOption } from 'components/ui/Dropdown'
import { useMetroStore } from '@/store'
import { useMemo } from 'react'
import type { TransferNode } from '../types'

interface AddElementData {
  lineOptions: Array<DropdownOption<string>>
  transferNodes: Array<TransferNode>
  hasLines: boolean
}

export const useCreateElementData = (): AddElementData => {
  const lines = useMetroStore((state) => state.lines)
  const stations = useMetroStore((state) => state.stations)
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const lineOptions = useMemo(
    () => lines.map((line) => ({ value: line.id, label: line.name, color: line.color })),
    [lines]
  )

  const transferNodes = useMemo((): Array<TransferNode> => {
    const stationById = new Map(stations.map((s) => [s.id, s]))
    const colorByLineId = new Map(lines.map((l) => [String(l.id), l.color]))

    const nodes: Array<TransferNode> = []

    for (const [visualId, stationIds] of Object.entries(visualToStations)) {
      const nodeStations = stationIds.flatMap((id) => {
        const station = stationById.get(id)
        return station ? [station] : []
      })

      if (nodeStations.length === 0) continue

      const colors = [
        ...new Set(
          nodeStations.flatMap((s) => {
            const color = colorByLineId.get(String(s.line_id))
            return color ? [color] : []
          })
        ),
      ]

      nodes.push({
        visualId,
        name: nodeStations[0].name,
        lineIds: nodeStations.map((s) => String(s.line_id)),
        colors,
      })
    }

    return nodes.sort((a, b) => a.name.localeCompare(b.name))
  }, [stations, lines, visualToStations])

  return { lineOptions, transferNodes, hasLines: lines.length > 0 }
}
