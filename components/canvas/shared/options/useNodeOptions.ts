import { useMetroStore } from '@/store'
import { useMemo } from 'react'
import { buildNodeOptions } from './buildNodeOptions'

/** Все узлы схемы как опции для Dropdown. Потребитель фильтрует по value или lineIds. */
export const useNodeOptions = () => {
  const stations = useMetroStore((state) => state.stations)
  const lines = useMetroStore((state) => state.lines)
  const visualToStations = useMetroStore((state) => state.visualToStations)

  return useMemo(
    () => buildNodeOptions({ stations, lines, visualToStations }),
    [stations, lines, visualToStations]
  )
}
