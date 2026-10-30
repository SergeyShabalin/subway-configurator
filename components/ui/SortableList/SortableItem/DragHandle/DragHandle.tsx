import { forwardRef, type ButtonHTMLAttributes } from 'react'
import styles from './DragHandle.module.css'

interface DragHandleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
}

export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(
  ({ label = 'Drag to reorder', ...props }, ref) => (
    <button ref={ref} type="button" className={styles.handle} aria-label={label} {...props}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <path
          d="M2 4h12M2 8h12M2 12h12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
)

DragHandle.displayName = 'DragHandle'
