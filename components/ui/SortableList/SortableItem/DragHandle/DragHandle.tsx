'use client'

import { useTranslations } from 'next-intl'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import styles from './DragHandle.module.css'

interface DragHandleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
}

export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(
  ({ label, ...props }, ref) => {
    const t = useTranslations('SortableList')

    return (
      <button
        ref={ref}
        type="button"
        className={styles.handle}
        aria-label={label ?? t('dragHandle')}
        {...props}
      >
        <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden>
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeLinecap="round" />
        </svg>
      </button>
    )
  }
)

DragHandle.displayName = 'DragHandle'
