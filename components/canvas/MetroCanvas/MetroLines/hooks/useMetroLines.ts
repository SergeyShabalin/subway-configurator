import { useMetroStore } from '@/store'
import { useMemo } from 'react'

export const useMetroLines = () => {
  const lines = useMetroStore((state) => state.lines)

  const lineData = useMemo(() => {
    return lines.map((line) => ({
      id: line.id,
      color: line.color,
      visualStationIds: line.visualStationIds || [],
    }))
  }, [lines])

  return { lineData }
}
