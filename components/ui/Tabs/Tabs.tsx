'use client'

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

  return (
    <div className={classNames} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.value === value

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
