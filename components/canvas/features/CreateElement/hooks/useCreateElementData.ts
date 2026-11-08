import { useLineOptions } from '@/components/canvas/shared/options/useLineOptions'
import { useMetroStore } from '@/store'
import type { Line } from '@/types/metro'
import { useMemo } from 'react'
import type { TransferNode } from '../types'

interface AddElementData {
  lineOptions: ReturnType<typeof useLineOptions>
  transferNodes: Array<TransferNode>
  hasLines: boolean
}

export const useCreateElementData = (): AddElementData => {
  const lines = useMetroStore((state) => state.lines)
  const stations = useMetroStore((state) => state.stations)
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const lineOptions = useLineOptions()

  const transferNodes = useMemo((): Array<TransferNode> => {
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
  }, [stations, lines, visualToStations])

  return { lineOptions, transferNodes, hasLines: lines.length > 0 }
}
