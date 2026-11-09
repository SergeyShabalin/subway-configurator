import { useMetroStore } from '@/store'
import type { VisualStation } from '@/types/metro'
import { useMemo } from 'react'
import { getTransferColors } from '../utils/getTransferColors'

export const useTransferColors = (visuals: Record<string, VisualStation>) => {
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const stations = useMetroStore((state) => state.stations)
  const lines = useMetroStore((state) => state.lines)

  return useMemo(
    () =>
      getTransferColors({
        visuals,
        visualToStations,
        stations,
        lines,
      }),
    [visuals, visualToStations, stations, lines]
  )
}
