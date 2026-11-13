'use client'

import { Button } from '@/components/ui/Button'
import { useTranslations } from 'next-intl'
import styles from '../AlignStationsTab.module.css'
import type { useAlignStations } from '../hooks/useAlignStations'

interface AlignControlsProps {
  controls: ReturnType<typeof useAlignStations>['controls']
}

export const AlignControls = ({ controls }: AlignControlsProps) => {
  const t = useTranslations('AlignStationsTab')
  const { canAlign, canUndo, isSaving, align, undo } = controls

  return (
    <div className={styles.actions}>
      <Button
        title={t('apply')}
        variant="outlineColored"
        color="success"
        onClick={align}
        loading={isSaving}
        disabled={!canAlign}
      />
      <Button
        title={t('undo')}
        variant="outline"
        color="primary"
        onClick={undo}
        disabled={!canUndo}
      />
    </div>
  )
}
