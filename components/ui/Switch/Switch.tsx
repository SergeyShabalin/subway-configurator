import type { InputHTMLAttributes, RefObject } from 'react'
import { useId } from 'react'
import styles from './Switch.module.css'

interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'role' | 'checked' | 'onChange'
> {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  ref?: RefObject<HTMLInputElement | null>
}

export const Switch = ({
  label,
  description,
  checked,
  onCheckedChange,
  className,
  disabled,
  ref,
  ...props
}: SwitchProps) => {
  const inputId = useId()
  const descriptionId = useId()

  return (
    <label
      className={[styles.switch, className].filter(Boolean).join(' ')}
      htmlFor={inputId}
      data-disabled={disabled || undefined}
    >
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description && (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        )}
      </span>

      <input
        {...props}
        id={inputId}
        ref={ref}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </label>
  )
}
