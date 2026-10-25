import { stationsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useEffect, useMemo, useState } from 'react'
import type { LineOption } from '../EditStationModal/DeleteFromLineModal/DeleteFromLineModal'

interface TransferItem {
  id: string
  otherStationName: string
  timeMinutes: number
  color?: string
}

interface StationData {
  stationName: string
  currentLineName?: string
  currentLineColor?: string
  transfers: Array<TransferItem>
  transferCount: number
  lineOptions: Array<LineOption>
  fromVisualId?: string
  existingTransferIds: Array<string>
}

export const useSelectedStationData = (stationId: string | null): StationData | null => {
  const station = useMetroStore((state) =>
    stationId ? state.stations.find((s) => s.id === stationId) : undefined
  )
  const stations = useMetroStore((state) => state.stations)
  const lines = useMetroStore((state) => state.lines)
  const visualTransfers = useMetroStore((state) => state.visualTransfers)
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const [transferCount, setTransferCount] = useState(1)

  useEffect(() => {
    if (!stationId) return
    let cancelled = false

    stationsService.countTransferStations(stationId).then((count) => {
      if (!cancelled) {
        setTransferCount(count)
      }
    })

    return () => {
      cancelled = true
    }
  }, [stationId])

  return useMemo(() => {
    if (!station || !stationId) return null

    const fromVisualId = Object.entries(visualToStations).find(([, stationIds]) =>
      stationIds.includes(stationId)
    )?.[0]

    const stationTransfers = fromVisualId
      ? visualTransfers.filter(
          (tr) => tr.from_visual_id === fromVisualId || tr.to_visual_id === fromVisualId
        )
      : []

    const transfers: Array<TransferItem> = stationTransfers.map((transfer) => {
      const otherVisualId =
        transfer.from_visual_id === fromVisualId ? transfer.to_visual_id : transfer.from_visual_id

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

    const currentLine = lines.find((line) => String(line.id) === String(station.line_id))

    const existingTransferIds = stationTransfers.map((tr) =>
      tr.from_visual_id === fromVisualId ? tr.to_visual_id : tr.from_visual_id
    )

    // Станции узла (по одной на ветку) для выбора, откуда удалять
    const nodeStationIds = fromVisualId ? (visualToStations[fromVisualId] ?? []) : []

    const lineOptions = nodeStationIds.flatMap((id): Array<LineOption> => {
      const nodeStation = stations.find((s) => s.id === id)
      const line = nodeStation
        ? lines.find((l) => String(l.id) === String(nodeStation.line_id))
        : undefined

      if (!nodeStation || !line) return []

      return [
        {
          stationId: nodeStation.id,
          lineId: line.id,
          lineName: line.name,
          lineColor: line.color,
        },
      ]
    })

    return {
      stationName: station.name,
      currentLineName: currentLine?.name,
      currentLineColor: currentLine?.color,
      transfers,
      transferCount,
      lineOptions,
      fromVisualId,
      existingTransferIds,
    }
  }, [station, stationId, stations, lines, visualTransfers, visualToStations, transferCount])
}
