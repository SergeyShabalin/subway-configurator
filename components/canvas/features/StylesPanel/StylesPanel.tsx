'use client'

import { IconTabs, type IconTabItem } from '@/components/ui/IconTabs/IconTabs'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import styles from './StylesPanel.module.css'
import { LabelStyleTab } from './tabs/LabelStyleTab'

type StylesTab = 'labels'

export const StylesPanel = () => {
  const t = useTranslations('StylesPanel')
  const [tab, setTab] = useState<StylesTab>('labels')

  const tabs: Array<IconTabItem<StylesTab>> = [
    { value: 'labels', label: t('tabLabels'), icon: <span aria-hidden>Aa</span> },
  ]

  return (
    <div className={styles.content}>
      <IconTabs value={tab} tabs={tabs} onChange={setTab} />
      {tab === 'labels' && <LabelStyleTab />}
    </div>
  )
}
