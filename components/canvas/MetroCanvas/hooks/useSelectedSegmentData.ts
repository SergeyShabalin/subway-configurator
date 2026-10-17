'use client'

import { useMetroStore } from '@/store'
import { useMemo } from 'react'
import type { SelectedSegment } from './useSegmentSelection'

export interface SelectedSegmentData {
  fromStationName: string
  toStationName: string
  timeMinutes: number
  lineName?: string
  lineColor?: string
  segmentId?: string
}

export const useSelectedSegmentData = (
  selectedSegment: SelectedSegment | null
): SelectedSegmentData | null => {
  const segments = useMetroStore((state) => state.segments)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const stations = useMetroStore((state) => state.stations)
  const lines = useMetroStore((state) => state.lines)

  return useMemo(() => {
    if (!selectedSegment) return null

    const fromStationIds = visualToStations[selectedSegment.fromVisualId] ?? []
    const toStationIds = visualToStations[selectedSegment.toVisualId] ?? []

    const segment = segments.find((s) => {
      if (s.line_id !== selectedSegment.lineId) return false

      const matchForward =
        fromStationIds.includes(s.from_station_id) && toStationIds.includes(s.to_station_id)
      const matchBackward =
        fromStationIds.includes(s.to_station_id) && toStationIds.includes(s.from_station_id)

      return matchForward || matchBackward
    })

    const stationNames: Record<string, string> = {}
    for (const station of stations) {
      stationNames[station.id] = station.name
    }

    const fromStationId = segment?.from_station_id ?? fromStationIds[0]
    const toStationId = segment?.to_station_id ?? toStationIds[0]

    const line = lines.find((l) => l.id === selectedSegment.lineId)

    return {
      fromStationName: fromStationId ? (stationNames[fromStationId] ?? fromStationId) : '—',
      toStationName: toStationId ? (stationNames[toStationId] ?? toStationId) : '—',
      timeMinutes: segment?.time_minutes ?? 0,
      lineName: line?.name,
      lineColor: line?.color,
      segmentId: segment?.id,
    }
  }, [selectedSegment, segments, visualToStations, stations, lines])
}
