import { useMetroStore } from '@/store'
import { useMemo } from 'react'

export interface SelectedTransferData {
  transferId: string
  fromStationName: string
  toStationName: string
  fromColor?: string
  toColor?: string
  timeMinutes: number
}

export const useSelectedTransferData = (transferId: string | null): SelectedTransferData | null => {
  const visualTransfers = useMetroStore((state) => state.visualTransfers)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const stations = useMetroStore((state) => state.stations)
  const lines = useMetroStore((state) => state.lines)

  return useMemo(() => {
    if (!transferId) return null

    const transfer = visualTransfers.find((tr) => tr.id === transferId)
    if (!transfer) return null

    const describe = (visualId: string) => {
      const stationId = visualToStations[visualId]?.[0]
      const station = stationId ? stations.find((s) => s.id === stationId) : undefined
      const line = station ? lines.find((l) => String(l.id) === String(station.line_id)) : undefined

      return { name: station?.name ?? visualId, color: line?.color }
    }

    const from = describe(transfer.from_visual_id)
    const to = describe(transfer.to_visual_id)

    return {
      transferId: transfer.id,
      fromStationName: from.name,
      toStationName: to.name,
      fromColor: from.color,
      toColor: to.color,
      timeMinutes: transfer.time_minutes,
    }
  }, [transferId, visualTransfers, visualToStations, stations, lines])
}
