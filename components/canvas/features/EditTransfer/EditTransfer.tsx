'use client'

import { TransferIcon } from '@/components/ui/Icons/TransferIcon/TransferIcon'
import { Modal } from '@/components/ui/Modal/Modal'
import { transfersService } from '@/src/lib/services/'
import { useTranslations } from 'next-intl'
import { useSelectedTransferData } from '../../MetroCanvas/hooks/useSelectedTransferData'
import { EditTransferModal } from './EditTransferModal/EditTransferModal'

interface EditTransferProps {
  isOpen: boolean
  transferId: string | null
  onClose: () => void
  reloadData: () => Promise<void>
}

export const EditTransfer = ({ isOpen, transferId, onClose, reloadData }: EditTransferProps) => {
  const t = useTranslations('EditTransfer')
  const transferData = useSelectedTransferData(transferId)

  const handleSave = async (timeMinutes: number) => {
    if (!transferId) return
    await transfersService.updateTime(transferId, timeMinutes)
    await reloadData()
  }

  const handleDelete = async () => {
    if (!transferId) return
    await transfersService.delete(transferId)
    await reloadData()
  }

  if (!isOpen || !transferData) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} icon={<TransferIcon />}>
      <EditTransferModal
        key={transferData.transferId}
        onClose={onClose}
        fromStationName={transferData.fromStationName}
        toStationName={transferData.toStationName}
        fromColor={transferData.fromColor}
        toColor={transferData.toColor}
        timeMinutes={transferData.timeMinutes}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Modal>
  )
}
