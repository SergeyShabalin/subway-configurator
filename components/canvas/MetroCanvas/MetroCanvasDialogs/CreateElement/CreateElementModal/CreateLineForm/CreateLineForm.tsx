'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input/Input'
import type { LineType } from '@/types/metro'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import styles from './CreateLineForm.module.css'
import { handleCreateLineError } from './helpers/handleCreateLineError'
import { useCreateLineForm } from './hooks/useCreateLineForm'
import type { CreateLineFormProps } from './types'

export const CreateLineForm = ({
  onSubmit,
  onSuccess,
  onCancel,
  onLoadingChange,
}: CreateLineFormProps) => {
  const t = useTranslations('CreateLineForm')

  const { state, actions } = useCreateLineForm({
    onSubmit,
    onSuccess,
    onLoadingChange,
    onError: (error) => handleCreateLineError(error, t),
  })

  const typeOptions = useMemo<Array<DropdownOption<LineType>>>(
    () => [
      { value: 'subway', label: t('typeSubway') },
      { value: 'commuter_rail', label: t('typeCommuterRail') },
    ],
    [t]
  )

  return (
    <form onSubmit={actions.handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Input
          value={state.lineName}
          label={t('nameLabel')}
          onChange={(e) => actions.setLineName(e.target.value)}
          placeholder={t('namePlaceholder')}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <Dropdown<LineType>
          value={state.lineType}
          options={typeOptions}
          onChange={actions.setLineType}
          label={t('typeLabel')}
          placeholder={t('typePlaceholder')}
        />
      </div>

      <div className={styles.field}>
        <Input
          type="color"
          label={t('colorLabel')}
          value={state.lineColor}
          onChange={(e) => actions.setLineColor(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Input
          label={t('lineBadge')}
          type="text"
          value={state.lineBadge}
          onChange={(e) => actions.setLineBadge(e.target.value)}
          disabled={state.isLoading}
        />
      </div>

      <div className={styles.actions}>
        <Button
          title={t('cancel')}
          variant="outline"
          onClick={onCancel}
          disabled={state.isLoading}
        />
        <Button
          title={t('submit')}
          type="submit"
          loading={state.isLoading}
          disabled={state.isSubmitDisabled}
        />
      </div>
    </form>
  )
}
