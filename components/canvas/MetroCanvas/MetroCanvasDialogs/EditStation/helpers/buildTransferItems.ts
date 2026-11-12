import type { Line, Station, VisualTransfer } from '@/types/metro'
import type { TransferItem } from '../types'

export const getOtherVisualId = (transfer: VisualTransfer, visualId: string | undefined) =>
  transfer.from_visual_id === visualId ? transfer.to_visual_id : transfer.from_visual_id

export const buildTransferItems = (
  stationTransfers: ReadonlyArray<VisualTransfer>,
  fromVisualId: string | undefined,
  stations: ReadonlyArray<Station>,
  lines: ReadonlyArray<Line>,
  visualToStations: Readonly<Record<string, ReadonlyArray<string>>>
): Array<TransferItem> =>
  stationTransfers.map((transfer) => {
    const otherVisualId = getOtherVisualId(transfer, fromVisualId)

    const otherStationIds = visualToStations[otherVisualId] ?? []
    const otherStationId = otherStationIds[0]
    const otherStation = stations.find((s) => s.id === otherStationId)
    const otherLine = otherStation
      ? lines.find((line) => String(line.id) === String(otherStation.line_id))
      : undefined

    return {
      id: transfer.id,
      otherStationName: otherStation?.name ?? otherVisualId,
      timeMinutes: transfer.time_minutes,
      color: otherLine?.color,
    }
  })
