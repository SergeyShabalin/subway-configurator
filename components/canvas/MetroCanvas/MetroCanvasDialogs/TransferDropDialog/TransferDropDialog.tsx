'use client'

import { CreateTransferModal } from '@/components/canvas/features'
import { useState } from 'react'
import type { TransferDraft } from '../../MetroMapLayer/MetroStations/TransferDrop/types'
import { CreateElement } from '../CreateElement/CreateElement'
import { useTransferDropPlan } from './hooks/useTransferDropPlan'
import { TransferDropChoiceModal } from './TransferDropChoiceModal'

type Step = 'choice' | 'transfer' | 'station'

interface TransferDropDialogProps {
  draft: TransferDraft | null
  onClose: () => void
  reloadData: () => Promise<void>
}

interface TransferDropFlowProps extends Omit<TransferDropDialogProps, 'draft'> {
  draft: TransferDraft
}

const TransferDropFlow = ({ draft, onClose, reloadData }: TransferDropFlowProps) => {
  const { existingTransferIds, needsChoice, initialLineId, initialInsertPosition } =
    useTransferDropPlan(draft)

  // Крайняя станция: даём выбор. Остальные: сразу пересадка
  const [step, setStep] = useState<Step>(needsChoice ? 'choice' : 'transfer')

  const handleTransferSuccess = async () => {
    onClose()
  }

  if (step === 'transfer') {
    return (
      <CreateTransferModal
        isOpen
        fromVisualId={draft.fromVisualId}
        initialToVisualId={draft.toVisualId}
        existingTransferIds={existingTransferIds}
        onCancel={onClose}
        onSuccess={handleTransferSuccess}
      />
    )
  }

  if (step === 'station') {
    return (
      <CreateElement
        isOpen
        position={draft.dropPosition}
        initialLineId={initialLineId}
        initialInsertPosition={initialInsertPosition}
        initialTransferVisualId={draft.toVisualId}
        onClose={onClose}
        reloadData={reloadData}
      />
    )
  }

  return (
    <TransferDropChoiceModal
      isOpen
      onClose={onClose}
      onSelectTransfer={() => setStep('transfer')}
      onSelectStation={() => setStep('station')}
    />
  )
}

export const TransferDropDialog = ({ draft, onClose, reloadData }: TransferDropDialogProps) => {
  if (!draft) return null

  return (
    <TransferDropFlow
      key={`${draft.fromVisualId}-${draft.toVisualId}`}
      draft={draft}
      onClose={onClose}
      reloadData={reloadData}
    />
  )
}
