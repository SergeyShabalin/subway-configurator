import { TransferNode } from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/CreateElement/types'
import { lineMarker } from '@/components/canvas/shared/options/optionMarkers'
import type { DropdownOption } from '@/components/ui/Dropdown'
import { useMemo } from 'react'

const toOption = (node: TransferNode): DropdownOption<string> => ({
  value: node.visualId,
  label: node.name,
  leading: lineMarker(node.lines),
})

export const useTransferOptions = (
  transferNodes: Array<TransferNode> | undefined,
  selectedLineId: string,
  /** Узел, который должен быть виден в списке, даже пока линия не выбрана */
  pinnedVisualId?: string
): Array<DropdownOption<string>> =>
  useMemo((): Array<DropdownOption<string>> => {
    const nodes = transferNodes ?? []

    if (!selectedLineId) {
      const pinned = pinnedVisualId ? nodes.find((n) => n.visualId === pinnedVisualId) : undefined
      return pinned ? [toOption(pinned)] : []
    }

    return nodes.filter((node) => !node.lineIds.includes(String(selectedLineId))).map(toOption)
  }, [transferNodes, selectedLineId, pinnedVisualId])
