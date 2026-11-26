'use client'

import { LineIcon } from '@/components/ui/Icons'
import { IconTabs, type IconTabItem } from '@/components/ui/IconTabs/IconTabs'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import styles from './StylesPanel.module.css'
import { LabelStyleTab } from './tabs/LabelStyleTab'
import { LineStyleTab } from './tabs/LineStyleTab'

type StylesTab = 'labels' | 'lines'

export const StylesPanel = () => {
  const t = useTranslations('StylesPanel')
  const [tab, setTab] = useState<StylesTab>('labels')

  const tabs: Array<IconTabItem<StylesTab>> = [
    { value: 'labels', label: t('tabLabels'), icon: <span aria-hidden>Aa</span> },
    { value: 'lines', label: t('tabLines'), icon: <LineIcon /> },
  ]

  return (
    <div className={styles.content}>
      <IconTabs value={tab} tabs={tabs} onChange={setTab} />
      {tab === 'labels' && <LabelStyleTab />}
      {tab === 'lines' && <LineStyleTab />}
    </div>
  )
}
