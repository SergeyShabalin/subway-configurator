'use client'

import { Button } from '@/components/ui/Button'
import { useTranslations } from 'next-intl'
import styles from '../EditStationModal.module.css'

interface StationActionsProps {
  isLoading: boolean
  isSaveDisabled: boolean
  onSave: () => void
  onDelete: () => void
}

export const StationActions = ({
  isLoading,
  isSaveDisabled,
  onSave,
  onDelete,
}: StationActionsProps) => {
  const t = useTranslations('EditStation')

  return (
    <div className={styles.actions}>
      <Button
        title={t('save')}
        variant="outlineColored"
        color="success"
        onClick={onSave}
        loading={isLoading}
        disabled={isSaveDisabled}
      />

      <Button
        title={t('delete')}
        variant="outlineColored"
        color="danger"
        onClick={onDelete}
        disabled={isLoading}
      />
    </div>
  )
}
