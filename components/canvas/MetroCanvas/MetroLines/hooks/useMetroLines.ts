import { useMetroStore } from '@/store'
import type { LineType } from '@/types/metro'
import { useMemo } from 'react'

export interface MetroLineData {
  id: string
  name: string
  color: string
  visualStationIds: Array<string>
  isCircular: boolean
  type: LineType
  lineBadge?: string
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
      type: line.type ?? 'subway',
      lineBadge: line.lineBadge,
    }))
  }, [lines])

  return { lineData }
}
