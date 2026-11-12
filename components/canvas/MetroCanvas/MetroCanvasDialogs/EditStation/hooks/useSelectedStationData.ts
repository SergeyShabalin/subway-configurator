import { useMetroStore } from '@/store'
import { useMemo } from 'react'
import { buildEditStationData } from '../helpers/buildEditStationData'
import type { EditStationData } from '../types'
import { useStationTransferCount } from './useStationTransferCount'

export const useSelectedStationData = (stationId: string | null): EditStationData | null => {
  const station = useMetroStore((state) =>
    stationId ? state.stations.find((s) => s.id === stationId) : undefined
  )
  const stations = useMetroStore((state) => state.stations)
  const lines = useMetroStore((state) => state.lines)
  const visualTransfers = useMetroStore((state) => state.visualTransfers)
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const transferCount = useStationTransferCount(stationId)

  return useMemo(
    () =>
      buildEditStationData({
        station,
        stationId,
        stations,
        lines,
        visualTransfers,
        visualToStations,
        transferCount,
      }),
    [station, stationId, stations, lines, visualTransfers, visualToStations, transferCount]
  )
}
