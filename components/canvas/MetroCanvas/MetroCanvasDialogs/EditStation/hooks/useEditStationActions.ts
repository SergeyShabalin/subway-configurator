import { stationsService } from '@/src/lib/services'
import type { DeleteScope } from '../types'

export const useEditStationActions = (
  stationId: string | null,
  reloadData: () => Promise<void>
) => {
  const saveName = async (name: string) => {
    if (!stationId) return
    await stationsService.updateName(stationId, name)
    await reloadData()
  }

  const deleteStation = async (scope: DeleteScope) => {
    if (!stationId) return

    if (scope.type === 'line') {
      await stationsService.deleteFromLine(scope.stationId)
    } else {
      await stationsService.delete(stationId)
    }

    await reloadData()
  }

  return { saveName, deleteStation }
}
