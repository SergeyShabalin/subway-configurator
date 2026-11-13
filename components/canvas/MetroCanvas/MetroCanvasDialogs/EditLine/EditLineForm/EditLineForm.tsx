'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input/Input'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import styles from './EditLineForm.module.css'
import { buildLineTypeOptions } from './helpers/buildLineTypeOptions'
import { handleEditLineError } from './helpers/handleEditLineError'
import { useEditLineForm } from './hooks/useEditLineForm'
import type { EditLineFormProps } from './types'

export const EditLineForm = ({ line, onClose, reloadData }: EditLineFormProps) => {
  const t = useTranslations('EditLineForm')

  const { state, actions } = useEditLineForm({
    line,
    onClose,
    reloadData,
    onError: (error) => handleEditLineError(error, t),
  })

  const typeOptions = useMemo(() => buildLineTypeOptions(t), [t])

  return (
    <div className={styles.content}>
      <div className={styles.field}>
        <Input
          label={t('nameLabel')}
          type="text"
          value={state.name}
          onChange={actions.handleNameChange}
          disabled={state.isLoading}
        />
      </div>

      <div className={styles.field}>
        <Dropdown
          value={state.lineType}
          options={typeOptions}
          onChange={actions.setLineType}
          label={t('typeLabel')}
          placeholder={t('typePlaceholder')}
          disabled={state.isLoading}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('colorLabel')}</label>
        <div className={styles.colorPicker}>
          <input
            type="color"
            value={state.color}
            onChange={actions.handleColorChange}
            className={styles.colorInput}
            disabled={state.isLoading}
          />
          <span className={styles.colorValue}>{state.color}</span>
        </div>
      </div>

      <div className={styles.field}>
        <Input
          label={t('lineBadge')}
          type="text"
          value={state.lineBadge}
          onChange={actions.handleLineBadgeChange}
          disabled={state.isLoading}
        />
      </div>

      <div className={styles.field}>
        <Input
          type="checkbox"
          label={t('circularLabel')}
          checked={state.isCircular}
          onChange={actions.handleIsCircularChange}
          disabled={state.isLoading}
        />
      </div>

      <div className={styles.actions}>
        <Button
          title={t('save')}
          variant="outlineColored"
          color="success"
          onClick={actions.handleSave}
          loading={state.isLoading}
          disabled={state.isSaveDisabled}
        />
      </div>
    </div>
  )
}
