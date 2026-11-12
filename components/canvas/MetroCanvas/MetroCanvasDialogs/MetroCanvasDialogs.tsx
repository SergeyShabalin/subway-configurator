'use client'

import { EditLine } from '@/components/canvas/features/EditLine'
import { EditTransfer } from '@/components/canvas/features/EditTransfer'
import { EditStation } from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/EditStation/EditStation'
import { memo } from 'react'
import type { useCanvasContextMenu } from '../hooks/useCanvasContextMenu'
import type { CanvasSelection } from '../hooks/useCanvasSelection'
import type { TransferDraft } from '../MetroMapLayer/MetroStations/TransferDrop/types'
import { CreateElement } from './CreateElement/CreateElement'
import { TransferDropDialog } from './TransferDropDialog/TransferDropDialog'

interface MetroCanvasDialogsProps {
  modal: ReturnType<typeof useCanvasContextMenu>['modal']
  selection: CanvasSelection
  transferDraft: TransferDraft | null
  onTransferDraftClose: () => void
  reloadData: () => Promise<void>
}

export const MetroCanvasDialogs = memo(
  ({
    modal,
    selection,
    transferDraft,
    onTransferDraftClose,
    reloadData,
  }: MetroCanvasDialogsProps) => (
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
      <TransferDropDialog
        draft={transferDraft}
        onClose={onTransferDraftClose}
        reloadData={reloadData}
      />
    </>
  )
)

MetroCanvasDialogs.displayName = 'MetroCanvasDialogs'
