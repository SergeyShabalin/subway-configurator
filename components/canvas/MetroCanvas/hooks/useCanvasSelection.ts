import { useSegmentSelection } from '@/components/canvas/MetroCanvas/hooks/useSegmentSelection'
import { useStationSelection } from '@/components/canvas/MetroCanvas/hooks/useStationSelection'
import { useTransferSelection } from '@/components/canvas/MetroCanvas/hooks/useTransferSelection'

/** Единая точка выбора сущностей на карте. */
export const useCanvasSelection = () => {
  const { selectedStationId, selectStation, clearSelection: clearStation } = useStationSelection()
  const { selectedSegment, selectSegment, clearSelection: clearSegment } = useSegmentSelection()
  const {
    selectedTransferId,
    selectTransfer,
    clearSelection: clearTransfer,
  } = useTransferSelection()

  return {
    station: { selectedId: selectedStationId, select: selectStation, clear: clearStation },
    segment: { selected: selectedSegment, select: selectSegment, clear: clearSegment },
    transfer: { selectedId: selectedTransferId, select: selectTransfer, clear: clearTransfer },
  }
}

export type CanvasSelection = ReturnType<typeof useCanvasSelection>
