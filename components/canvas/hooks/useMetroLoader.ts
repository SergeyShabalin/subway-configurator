import { graphService } from '@/src/lib/services'
import type { GraphData, VisualStation } from '@/types/metro'
import { useCallback } from 'react'

export const useMetroLoader = () => {
  const transformApiData = useCallback((data: GraphData) => {
    const visualsMap: Record<string, VisualStation> = {}

    for (const v of data.visuals) {
      visualsMap[v.id] = {
        id: v.id,
        x: v.x,
        y: v.y,
        labelOffset: v.labelOffset,
        connections: v.connections,
        displayMode: v.displayMode,
        is_transfer: v.isTransfer ? 1 : 0,
      }
    }

    const namesMap: Record<string, string> = {}
    for (const station of data.stations) {
      namesMap[station.id] = station.name
    }

    return { visualsMap, namesMap }
  }, [])

  const loadData = useCallback(async () => {
    try {
      const data = await graphService.getGraph()
      const { visualsMap, namesMap } = transformApiData(data)
      return { visualsMap, namesMap, error: null }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load metro data')
      console.error('[useMetroLoader] Error:', error)
      return { visualsMap: null, namesMap: null, error }
    }
  }, [transformApiData])

  return { loadData }
}
