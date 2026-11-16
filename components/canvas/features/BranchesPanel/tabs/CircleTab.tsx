'use client'

import { Button } from '@/components/ui'
import { useTranslations } from 'next-intl'
import styles from '../BranchesPanel.module.css'
import type { useCircleLayout } from '../hooks/useCircleLayout'

type CircleLayout = ReturnType<typeof useCircleLayout>

interface CircleTabProps {
  radius: CircleLayout['radius']
  state: CircleLayout['state']
  actions: CircleLayout['actions']
}

export const CircleTab = ({ radius, state, actions }: CircleTabProps) => {
  const t = useTranslations('BranchesPanel')

  return (
    <>
      {state.tooShort && <p className={styles.message}>{t('tooShort')}</p>}

      {state.isReady && (
        <div className={styles.radius}>
          <label className={styles.label} htmlFor="circle-radius">
            {t('radiusLabel', { value: Math.round(radius.value) })}
          </label>
          <input
            id="circle-radius"
            type="range"
            min={radius.min}
            max={radius.max}
            value={radius.value}
            onChange={(e) => radius.change(Number(e.target.value))}
            disabled={state.isSaving}
          />
        </div>
      )}

      {state.status === 'saved' && <p className={styles.success}>{t('saved')}</p>}
      {state.status === 'error' && <p className={styles.message}>{t('error')}</p>}

      {state.isReady && (
        <div className={styles.actions}>
          <Button
            title={t('save')}
            variant="outlineColored"
            color="success"
            onClick={actions.save}
            loading={state.isSaving}
            disabled={!state.isDirty}
          />
          <Button
            title={t('cancel')}
            variant="outline"
            onClick={actions.cancel}
            disabled={!state.isDirty || state.isSaving}
          />
        </div>
      )}
    </>
  )
}
