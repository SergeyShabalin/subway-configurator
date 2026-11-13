import { useMetroStore } from '@/store'
import type { Line } from '@/types/metro'
import { useMemo } from 'react'
import { buildStationsTabItems } from '../helpers/buildStationsTabItems'
import type { StationsTabItem } from '../types'

export const useStationsTabItems = (line: Line): Array<StationsTabItem> => {
  const stations = useMetroStore((state) => state.stations)

  return useMemo(() => buildStationsTabItems(line, stations), [line, stations])
}
