'use client'

import { LineIcon, StationIcon } from '@/components/ui/Icons'
import { IconTabs, type IconTabItem } from '@/components/ui/IconTabs/IconTabs'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import styles from './StylesPanel.module.css'
import { LabelStyleTab } from './tabs/LabelStyleTab'
import { LineStyleTab } from './tabs/LineStyleTab'
import { StationStyleTab } from './tabs/StationStyleTab'

type StylesTab = 'labels' | 'lines' | 'stations'

export const StylesPanel = () => {
  const t = useTranslations('StylesPanel')
  const [tab, setTab] = useState<StylesTab>('labels')

  const tabs: Array<IconTabItem<StylesTab>> = [
    { value: 'labels', label: t('tabLabels'), icon: <span aria-hidden>Aa</span> },
    { value: 'lines', label: t('tabLines'), icon: <LineIcon /> },
    { value: 'stations', label: t('tabStations'), icon: <StationIcon /> },
  ]

  return (
    <div className={styles.content}>
      <IconTabs value={tab} tabs={tabs} onChange={setTab} />
      {tab === 'labels' && <LabelStyleTab />}
      {tab === 'lines' && <LineStyleTab />}
      {tab === 'stations' && <StationStyleTab />}
    </div>
  )
}
