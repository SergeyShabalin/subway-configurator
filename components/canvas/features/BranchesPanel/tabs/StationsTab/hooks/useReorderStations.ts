import { linesService } from '@/src/lib/services'
import { useMetroStore } from '@/store'

export const useReorderStations = (lineId: string) => {
  const loadData = useMetroStore((state) => state.loadData)

  return async (orderedStationIds: Array<string>) => {
    await linesService.reorderStations(lineId, orderedStationIds)
    await loadData()
  }
}
