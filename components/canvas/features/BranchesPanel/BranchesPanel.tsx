'use client'

import { Dropdown } from '@/components/ui/Dropdown'
import { Tabs } from '@/components/ui/Tabs'
import { useTranslations } from 'next-intl'
import styles from './BranchesPanel.module.css'
import { useBranchesPanel } from './hooks/useBranchesPanel'
import { CircleTab } from './tabs/CircleTab'
import { MoveTab } from './tabs/MoveTab'
import type { BranchesTab } from './types'

export const BranchesPanel = () => {
  const t = useTranslations('BranchesPanel')
  const { tab, selectTab, circle, move } = useBranchesPanel()

  const tabs: Array<{ value: BranchesTab; label: string }> = [
    { value: 'move', label: t('tabMove') },
    { value: 'circle', label: t('tabCircle') },
  ]

  return (
    <div className={styles.content}>
      <Tabs variant="outline" value={tab} onChange={selectTab} tabs={tabs} />

      <p className={styles.hint}>{t(tab === 'move' ? 'moveDescription' : 'circleDescription')}</p>

      <Dropdown
        label={t('lineLabel')}
        value={circle.picker.lineId}
        options={circle.picker.lineOptions}
        placeholder={t('placeholder')}
        emptyMessage={t('placeholder')}
        onChange={circle.picker.selectLine}
        disabled={circle.state.isSaving}
        largeList
      />

      {tab === 'move' && <MoveTab move={move} />}
      {tab === 'circle' && (
        <CircleTab radius={circle.radius} state={circle.state} actions={circle.actions} />
      )}
    </div>
  )
}
