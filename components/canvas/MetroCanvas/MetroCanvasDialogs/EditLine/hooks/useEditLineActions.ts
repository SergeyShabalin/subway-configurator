import { segmentsService } from '@/src/lib/services'
import type { SelectedSegmentData } from '../types'

interface UseEditLineActionsParams {
  segmentId: SelectedSegmentData['segmentId'] | undefined
  reloadData: () => Promise<void>
}

export const useEditLineActions = ({ segmentId, reloadData }: UseEditLineActionsParams) => {
  const saveSegmentTime = async (timeMinutes: number) => {
    if (!segmentId) return
    await segmentsService.updateTime(segmentId, timeMinutes)
    await reloadData()
  }

  return { saveSegmentTime }
}
