import { Button } from '@/components/ui/Button'
import type { ReactNode } from 'react'
import styles from './IconTabs.module.css'

export interface IconTabItem<T extends string> {
  value: T
  label: string
  icon: ReactNode
}

interface IconTabsProps<T extends string> {
  value: T
  tabs: Array<IconTabItem<T>>
  onChange: (value: T) => void
}

export function IconTabs<T extends string>({ value, tabs, onChange }: IconTabsProps<T>) {
  return (
    <div className={styles.list} role="group">
      {tabs.map((tab) => (
        <span key={tab.value} className={styles.item} data-tooltip={tab.label}>
          <Button
            variant="soft"
            iconOnly
            className={styles.button}
            active={value === tab.value}
            onClick={() => onChange(tab.value)}
            aria-label={tab.label}
          >
            {tab.icon}
          </Button>
        </span>
      ))}
    </div>
  )
}
