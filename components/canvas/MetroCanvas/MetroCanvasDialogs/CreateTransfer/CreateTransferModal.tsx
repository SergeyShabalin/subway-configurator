'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown'
import { TransferIcon } from '@/components/ui/Icons/TransferIcon/TransferIcon'
import { Input } from '@/components/ui/Input/Input'
import { Modal } from '@/components/ui/Modal/Modal'
import type { TransferStyle } from '@/src/lib/services/transfers.service'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import styles from './CreateTransferModal.module.css'
import { handleCreateTransferError } from './helpers/handleCreateTransferError'
import { useCreateTransferForm } from './hooks/useCreateTransferForm'
import type { CreateTransferModalProps } from './types'

export const CreateTransferModal = ({
  isOpen,
  fromVisualId,
  initialToVisualId,
  existingTransferIds,
  onCancel,
  onSuccess,
}: CreateTransferModalProps) => {
  const t = useTranslations('CreateTransferModal')

  const { state, actions } = useCreateTransferForm({
    fromVisualId,
    initialToVisualId,
    existingTransferIds,
    onSuccess,
    onError: (error) => handleCreateTransferError(error, t),
  })

  const styleOptions = useMemo<Array<DropdownOption<TransferStyle>>>(
    () => [
      { value: 'dashed', label: t('styleDashed') },
      { value: 'dotted', label: t('styleDotted') },
      { value: 'solid', label: t('styleSolid') },
    ],
    [t]
  )

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={t('title')} icon={<TransferIcon />}>
      <form onSubmit={actions.handleSubmit} className={styles.form}>
        <Dropdown
          value={state.selectedVisualId}
          options={state.options}
          onChange={actions.setSelectedVisualId}
          label={t('targetLabel')}
          placeholder={t('targetPlaceholder')}
          emptyMessage={t('noTargets')}
        />

        <Dropdown
          value={state.transferStyle}
          options={styleOptions}
          onChange={actions.setTransferStyle}
          label={t('styleLabel')}
          placeholder={t('stylePlaceholder')}
        />

        <Input
          type="text"
          label={t('timeLabel')}
          value={String(state.timeMinutes)}
          onChange={(e) => actions.setTimeMinutes(Number(e.target.value) || 0)}
        />

        <div className={styles.actions}>
          <Button
            title={t('cancel')}
            variant="outline"
            size="medium"
            onClick={onCancel}
            disabled={state.isLoading}
          />
          <Button
            title={t('submit')}
            size="medium"
            type="submit"
            loading={state.isLoading}
            disabled={state.isSubmitDisabled}
          />
        </div>
      </form>
    </Modal>
  )
}
