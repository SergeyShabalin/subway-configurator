import { linesService, segmentsService } from '@/src/lib/services'
import type { Line } from '@/types/metro'
import type { SelectedSegmentData } from '../types'

interface UseEditLineActionsParams {
  line: Line | null
  segmentId: SelectedSegmentData['segmentId'] | undefined
  reloadData: () => Promise<void>
}

export const useEditLineActions = ({ line, segmentId, reloadData }: UseEditLineActionsParams) => {
  const saveSegmentTime = async (timeMinutes: number) => {
    if (!segmentId) return
    await segmentsService.updateTime(segmentId, timeMinutes)
    await reloadData()
  }

  const reorderStations = async (orderedStationIds: Array<string>) => {
    if (!line) return
    await linesService.reorderStations(String(line.id), orderedStationIds)
    await reloadData()
  }

  return { saveSegmentTime, reorderStations }
}
