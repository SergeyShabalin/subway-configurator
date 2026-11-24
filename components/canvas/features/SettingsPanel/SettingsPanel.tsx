'use client'

import { Switch } from '@/components/ui/Switch/Switch'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import styles from './SettingsPanel.module.css'

export const SettingsPanel = () => {
  const t = useTranslations('SettingsPanel')
  const isDragEnabled = useMetroStore((state) => state.isDragEnabled)
  const setDragEnabled = useMetroStore((state) => state.setDragEnabled)

  return (
    <div className={styles.content}>
      <Switch
        label={t('dragLabel')}
        description={t('dragDescription')}
        checked={isDragEnabled}
        onCheckedChange={setDragEnabled}
      />
    </div>
  )
}
