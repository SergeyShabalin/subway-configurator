import { TransferNode } from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/CreateElement/types'
import { lineMarker } from '@/components/canvas/shared/options/optionMarkers'
import type { DropdownOption } from '@/components/ui/Dropdown'
import { useMemo } from 'react'

export const useTransferOptions = (
  transferNodes: Array<TransferNode> | undefined,
  selectedLineId: string
): Array<DropdownOption<string>> =>
  useMemo((): Array<DropdownOption<string>> => {
    if (!selectedLineId) return []

    return (transferNodes ?? [])
      .filter((node) => !node.lineIds.includes(String(selectedLineId)))
      .map((node) => ({ value: node.visualId, label: node.name, leading: lineMarker(node.lines) }))
  }, [transferNodes, selectedLineId])
