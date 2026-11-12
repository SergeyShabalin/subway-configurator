import type { Line, Station, VisualTransfer } from '@/types/metro'
import type { EditStationData } from '../types'
import { buildLineOptions } from './buildLineOptions'
import { buildTransferItems, getOtherVisualId } from './buildTransferItems'

interface BuildEditStationDataParams {
  station: Station | undefined
  stationId: string | null
  stations: ReadonlyArray<Station>
  lines: ReadonlyArray<Line>
  visualTransfers: ReadonlyArray<VisualTransfer>
  visualToStations: Readonly<Record<string, ReadonlyArray<string>>>
  transferCount: number
}

export const buildEditStationData = ({
  station,
  stationId,
  stations,
  lines,
  visualTransfers,
  visualToStations,
  transferCount,
}: BuildEditStationDataParams): EditStationData | null => {
  if (!station || !stationId) return null

  const fromVisualId = Object.entries(visualToStations).find(([, stationIds]) =>
    stationIds.includes(stationId)
  )?.[0]

  const stationTransfers = fromVisualId
    ? visualTransfers.filter(
        (tr) => tr.from_visual_id === fromVisualId || tr.to_visual_id === fromVisualId
      )
    : []

  const currentLine = lines.find((line) => String(line.id) === String(station.line_id))

  const existingTransferIds = stationTransfers.map((tr) => getOtherVisualId(tr, fromVisualId))

  const nodeStationIds = fromVisualId ? (visualToStations[fromVisualId] ?? []) : []

  return {
    stationName: station.name,
    currentLineName: currentLine?.name,
    currentLineColor: currentLine?.color,
    transfers: buildTransferItems(
      stationTransfers,
      fromVisualId,
      stations,
      lines,
      visualToStations
    ),
    transferCount,
    lineOptions: buildLineOptions(nodeStationIds, stations, lines),
    fromVisualId,
    existingTransferIds,
  }
}
