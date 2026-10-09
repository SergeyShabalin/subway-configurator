import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) => {
  const classNames = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classNames}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}

      {children}
    </button>
  )
}
