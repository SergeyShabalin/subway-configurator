'use client'

import { Dropdown } from '@/components/ui/Dropdown'
import { AlignIcon, CircleLayoutIcon, MoveIcon, OrderIcon } from '@/components/ui/Icons'
import { IconTabs, type IconTabItem } from '@/components/ui/IconTabs/IconTabs'
import { useTranslations } from 'next-intl'
import styles from './BranchesPanel.module.css'
import { useBranchesPanel } from './hooks/useBranchesPanel'
import { AlignTab } from './tabs/AlignTab/AlignTab'
import { CircleTab } from './tabs/CircleTab'
import { MoveTab } from './tabs/MoveTab'
import { StationsTab } from './tabs/StationsTab/StationsTab'
import type { BranchesTab } from './types'

const DESCRIPTION_KEY: Record<BranchesTab, string> = {
  move: 'moveDescription',
  circle: 'circleDescription',
  align: 'alignDescription',
  stations: 'stationsDescription',
}

export const BranchesPanel = () => {
  const t = useTranslations('BranchesPanel')
  const { tab, selectTab, line, circle, move } = useBranchesPanel()

  const tabs: Array<IconTabItem<BranchesTab>> = [
    { value: 'move', label: t('tabMove'), icon: <MoveIcon /> },
    { value: 'circle', label: t('tabCircle'), icon: <CircleLayoutIcon /> },
    { value: 'align', label: t('tabAlign'), icon: <AlignIcon /> },
    { value: 'stations', label: t('tabStations'), icon: <OrderIcon /> },
  ]

  const isLocked = circle.state.isDirty

  const renderTabContent: Record<BranchesTab, () => React.ReactNode> = {
    move: () => <MoveTab move={move} />,

    circle: () => (
      <CircleTab radius={circle.radius} state={circle.state} actions={circle.actions} />
    ),

    align: () => {
      if (!line) return <p className={styles.hint}>{t('moveSelectLine')}</p>

      return (
        <>
          {isLocked && <p className={styles.message}>{t('moveBlocked')}</p>}
          <AlignTab key={line.id} line={line} isLocked={isLocked} />
        </>
      )
    },

    stations: () => {
      if (!line) return <p className={styles.hint}>{t('moveSelectLine')}</p>
      if (isLocked) return <p className={styles.message}>{t('moveBlocked')}</p>

      return <StationsTab key={line.id} line={line} />
    },
  }

  return (
    <div className={styles.content}>
      <IconTabs value={tab} tabs={tabs} onChange={selectTab} />

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

      {renderTabContent[tab]()}
    </div>
  )
}
