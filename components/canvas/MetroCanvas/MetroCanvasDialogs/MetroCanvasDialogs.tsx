'use client'

import { EditLine } from '@/components/canvas/features/EditLine'
import { EditStation } from '@/components/canvas/features/EditStation'
import { EditTransfer } from '@/components/canvas/features/EditTransfer'
import { CreateElement } from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/CreateElement/CreateElement'
import { memo } from 'react'
import type { useCanvasContextMenu } from '../hooks/useCanvasContextMenu'
import type { CanvasSelection } from '../hooks/useCanvasSelection'

interface MetroCanvasDialogsProps {
  modal: ReturnType<typeof useCanvasContextMenu>['modal']
  selection: CanvasSelection
  reloadData: () => Promise<void>
}

export const MetroCanvasDialogs = memo(
  ({ modal, selection, reloadData }: MetroCanvasDialogsProps) => (
    <>
      <CreateElement
        key={modal.isModalOpen ? 'open' : 'closed'}
        isOpen={modal.isModalOpen}
        onClose={modal.closeModal}
        position={modal.clickPosition}
        reloadData={reloadData}
      />
      <EditStation
        isOpen={selection.station.selectedId !== null}
        stationId={selection.station.selectedId}
        onClose={selection.station.clear}
        reloadData={reloadData}
      />
      <EditLine
        isOpen={selection.segment.selected !== null}
        selectedSegment={selection.segment.selected}
        onClose={selection.segment.clear}
        reloadData={reloadData}
      />
      <EditTransfer
        isOpen={selection.transfer.selectedId !== null}
        transferId={selection.transfer.selectedId}
        onClose={selection.transfer.clear}
        reloadData={reloadData}
      />
    </>
  )
)

MetroCanvasDialogs.displayName = 'MetroCanvasDialogs'
