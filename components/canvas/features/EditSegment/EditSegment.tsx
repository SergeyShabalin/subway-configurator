'use client'

import { SelectedSegment } from '@/components/canvas/MetroCanvas/MetroLines/types'
import { stationsService } from '@/src/lib/services'
import { useSelectedSegmentData } from '../../MetroCanvas/hooks/useSelectedSegmentData'
import { EditSegmentModal } from './EditSegmentModal/EditSegmentModal'

interface EditSegmentProps {
  isOpen: boolean
  selectedSegment: SelectedSegment | null
  onClose: () => void
  reloadData: () => Promise<void>
}

export const EditSegment = ({ isOpen, selectedSegment, onClose, reloadData }: EditSegmentProps) => {
  const segmentData = useSelectedSegmentData(selectedSegment)

  const handleSave = async (timeMinutes: number) => {
    if (!segmentData?.segmentId) return
    await stationsService.updateSegmentTime(segmentData.segmentId, timeMinutes)
    await reloadData()
  }

  if (!segmentData) return null

  const segmentKey = selectedSegment
    ? `${selectedSegment.lineId}-${selectedSegment.fromVisualId}-${selectedSegment.toVisualId}`
    : 'empty'

  return (
    <EditSegmentModal
      key={segmentKey}
      isOpen={isOpen}
      onClose={onClose}
      fromStationName={segmentData.fromStationName}
      toStationName={segmentData.toStationName}
      timeMinutes={segmentData.timeMinutes}
      lineName={segmentData.lineName}
      lineColor={segmentData.lineColor}
      onSave={handleSave}
    />
  )
}
