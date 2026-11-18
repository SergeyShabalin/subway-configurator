// BranchesPanel.tsx
'use client'

import { Dropdown } from '@/components/ui/Dropdown'
import { Tabs } from '@/components/ui/Tabs'
import { useTranslations } from 'next-intl'
import styles from './BranchesPanel.module.css'
import { useBranchesPanel } from './hooks/useBranchesPanel'
import { AlignTab } from './tabs/AlignTab/AlignTab'
import { CircleTab } from './tabs/CircleTab'
import { MoveTab } from './tabs/MoveTab'
import type { BranchesTab } from './types'

const DESCRIPTION_KEY: Record<BranchesTab, string> = {
  move: 'moveDescription',
  circle: 'circleDescription',
  align: 'alignDescription',
}

export const BranchesPanel = () => {
  const t = useTranslations('BranchesPanel')
  const { tab, selectTab, line, circle, move } = useBranchesPanel()

  const tabs: Array<{ value: BranchesTab; label: string }> = [
    { value: 'move', label: t('tabMove') },
    { value: 'circle', label: t('tabCircle') },
    { value: 'align', label: t('tabAlign') },
  ]

  return (
    <div className={styles.content}>
      <Tabs variant="outline" value={tab} onChange={selectTab} tabs={tabs} />

      <p className={styles.hint}>{t(DESCRIPTION_KEY[tab])}</p>

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
      {/*TODO*/}
      {tab === 'move' && <MoveTab move={move} />}
      {tab === 'circle' && (
        <CircleTab radius={circle.radius} state={circle.state} actions={circle.actions} />
      )}
      {tab === 'align' &&
        (line ? (
          <>
            {circle.state.isDirty && <p className={styles.message}>{t('moveBlocked')}</p>}
            <AlignTab key={line.id} line={line} isLocked={circle.state.isDirty} />
          </>
        ) : (
          <p className={styles.hint}>{t('moveSelectLine')}</p>
        ))}
    </div>
  )
}
