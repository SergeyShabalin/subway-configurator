'use client'

import { Button } from '@/components/ui/Button'
import { TransferIcon } from '@/components/ui/Icons/TransferIcon/TransferIcon'
import { Modal } from '@/components/ui/Modal/Modal'
import { useTranslations } from 'next-intl'
import styles from './TransferDropChoiceModal.module.css'

interface TransferDropChoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTransfer: () => void
  onSelectStation: () => void
}

export const TransferDropChoiceModal = ({
  isOpen,
  onClose,
  onSelectTransfer,
  onSelectStation,
}: TransferDropChoiceModalProps) => {
  const t = useTranslations('TransferDropChoice')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} icon={<TransferIcon />}>
      <div className={styles.container}>
        <Button
          title={t('createTransfer')}
          variant="outlineColored"
          color="primary"
          onClick={onSelectTransfer}
        />
        <Button
          title={t('createSameNameStation')}
          variant="outlineColored"
          color="primary"
          onClick={onSelectStation}
        />
        <Button title={t('cancel')} variant="outline" onClick={onClose} />
      </div>
    </Modal>
  )
}
