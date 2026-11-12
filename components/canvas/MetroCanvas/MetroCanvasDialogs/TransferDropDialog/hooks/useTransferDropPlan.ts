import { getExistingTransferTargetIds } from '@/components/canvas/shared/transfers/getExistingTransferTargetIds'
import { getLineEdges } from '@/components/canvas/shared/transfers/getLineEdges'
import { useMetroStore } from '@/store'
import { useMemo } from 'react'
import type { TransferDraft } from '../../../MetroMapLayer/MetroStations/TransferDrop/types'

export const useTransferDropPlan = (draft: TransferDraft) => {
  const visualTransfers = useMetroStore((state) => state.visualTransfers)
  const lines = useMetroStore((state) => state.lines)
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const existingTransferIds = useMemo(
    () => getExistingTransferTargetIds(visualTransfers ?? [], draft.fromVisualId),
    [visualTransfers, draft.fromVisualId]
  )

  const edges = useMemo(
    () => getLineEdges(visualToStations[draft.fromVisualId] ?? [], lines),
    [visualToStations, lines, draft.fromVisualId]
  )

  // Линия и позиция однозначны, только если станция крайняя ровно на одной линии
  const edge = edges.length === 1 ? edges[0] : null

  return {
    existingTransferIds,
    needsChoice: edges.length > 0,
    initialLineId: edge?.lineId,
    initialInsertPosition: edge?.insertPosition,
  }
}
