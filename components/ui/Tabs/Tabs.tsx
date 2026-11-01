'use client'

import { Button } from '@/components/ui/Button'
import { useMemo, type ComponentProps } from 'react'
import styles from './Tabs.module.css'

type TabVariant = NonNullable<ComponentProps<typeof Button>['variant']>

const DEFAULT_ACTIVE_VARIANT: TabVariant = 'underline'
const INACTIVE_VARIANT: TabVariant = 'ghost'

export interface Tab<T extends string> {
  value: T
  label: string
}

interface TabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  tabs: Array<Tab<T>>
  variant?: TabVariant
  className?: string
}

export const Tabs = <T extends string>({
  value,
  onChange,
  tabs,
  variant = DEFAULT_ACTIVE_VARIANT,
  className,
}: TabsProps<T>) => {
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
            variant={isActive ? variant : INACTIVE_VARIANT}
            className={styles.tab}
            aria-selected={isActive}
            onClick={handlers[tab.value]}
          />
        )
      })}
    </div>
  )
}
