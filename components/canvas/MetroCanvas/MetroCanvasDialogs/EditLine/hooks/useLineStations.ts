import { useMetroStore } from '@/store'
import type { Line } from '@/types/metro'
import { useMemo } from 'react'
import { buildLineStationItems } from '../helpers/buildLineStationItems'
import type { LineStationItem } from '../types'

export const useLineStations = (line: Line | null): Array<LineStationItem> => {
  const stations = useMetroStore((state) => state.stations)

  return useMemo(() => (line ? buildLineStationItems(line, stations) : []), [line, stations])
}
