import { useMetroStore } from '@/store'
import { useMemo } from 'react'

export interface MetroLineData {
  id: string
  name: string
  color: string
  visualStationIds: Array<string>
  isCircular: boolean
}

export interface UseMetroLinesResult {
  lineData: Array<MetroLineData>
}

export const useMetroLines = (): UseMetroLinesResult => {
  const lines = useMetroStore((state) => state.lines)

  const lineData = useMemo<Array<MetroLineData>>(() => {
    return lines.map((line) => ({
      id: line.id,
      name: line.name,
      color: line.color,
      visualStationIds: line.visualStationIds ?? [],
      isCircular: line.is_circular === 1,
    }))
  }, [lines])

  return { lineData }
}
