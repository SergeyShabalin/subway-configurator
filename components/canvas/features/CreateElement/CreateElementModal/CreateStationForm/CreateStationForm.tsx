'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input/Input'
import { useTranslations } from 'next-intl'
import styles from './CreateStationForm.module.css'
import { handleCreateStationError } from './helpers/handleCreateStationError'
import { useCreateStationForm } from './hooks/useCreateStationForm'
import type { CreateStationFormProps } from './types'

export const CreateStationForm = (props: CreateStationFormProps) => {
  const t = useTranslations('CreateStationForm')

  const { state, actions } = useCreateStationForm(props)

  const onSubmit = async (e: React.FormEvent) => {
    const result = await actions.handleSubmit(e)
    if (!result.success) {
      handleCreateStationError(result.error, t)
    }
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <Dropdown
        value={state.selectedLineId}
        options={props.lineOptions}
        onChange={actions.handleLineChange}
        label={t('lineLabel')}
        placeholder={t('linePlaceholder')}
        emptyMessage={t('noLines')}
      />

      <Dropdown
        value={state.insertPosition}
        options={state.insertPositionOptions}
        onChange={actions.setInsertPosition}
        label={t('insertPositionLabel')}
        placeholder={t('insertPositionPlaceholder')}
        emptyMessage={t('noInsertPositionOptions')}
        disabled={!state.selectedLineId || state.insertPositionOptions.length === 0}
      />

      <div className={styles.field}>
        <Input
          type="text"
          label={t('nameLabel')}
          value={state.resolvedName}
          onChange={(e) => actions.setStationName(e.target.value)}
          placeholder={t('namePlaceholder')}
          disabled={!!state.transferVisualId}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <Dropdown
          value={state.transferVisualId}
          options={state.transferOptions}
          onChange={actions.setTransferVisualId}
          label={t('transferLabel')}
          placeholder={t('transferPlaceholder')}
          emptyMessage={t('noTransferOptions')}
          disabled={!state.selectedLineId}
        />
      </div>

      <div className={styles.field}>
        <Input
          type="text"
          inputMode="numeric"
          label={t('timeLabel')}
          value={state.time}
          onChange={actions.handleTimeChange}
          disabled={state.isLoading}
        />
      </div>

      <div className={styles.coordinates}>
        <span>
          {t('coordinates', { x: Math.round(props.position.x), y: Math.round(props.position.y) })}
        </span>
      </div>

      <div className={styles.spacer} />

      <div className={styles.actions}>
        <Button
          title={t('cancel')}
          variant="outline"
          size="medium"
          onClick={props.onCancel}
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
  )
}
