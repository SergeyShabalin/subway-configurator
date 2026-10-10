'use client'

import { Button } from '@/components/ui/Button'
import { useMemo } from 'react'
import styles from './Tabs.module.css'

export interface Tab<T extends string> {
  value: T
  label: string
}

interface TabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  tabs: Array<Tab<T>>
  className?: string
}

export const Tabs = <T extends string>({ value, onChange, tabs, className }: TabsProps<T>) => {
  const classNames = [styles.tabs, className].filter(Boolean).join(' ')

  const handlers = useMemo(() => {
    const map = {} as Record<T, () => void>

    for (const tab of tabs) {
      map[tab.value] = () => onChange(tab.value)
    }

    return map
  }, [tabs, onChange])

  return (
    <div className={classNames} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.value === value

        return (
          <Button
            title={tab.label}
            key={tab.value}
            role="tab"
            color="primary"
            variant={isActive ? 'underline' : 'ghost'}
            className={styles.tab}
            aria-selected={isActive}
            onClick={handlers[tab.value]}
          />
        )
      })}
    </div>
  )
}
