import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'outline' | 'outlineColored' | 'ghost' | 'underline'

export type ButtonSize = 'small' | 'medium' | 'large'

export type ButtonColor = 'primary' | 'success' | 'danger' | 'neutral' | 'white' | 'black'

const COLOR_CLASS: Record<ButtonColor, string> = {
  primary: styles.colorPrimary,
  success: styles.colorSuccess,
  danger: styles.colorDanger,
  neutral: styles.colorNeutral,
  white: styles.colorWhite,
  black: styles.colorBlack,
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  color?: ButtonColor
  children?: ReactNode
}

export const Button = ({
  title = '',
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  color,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    color && COLOR_CLASS[color],
    className,
  ]
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
      {title}
      {children}
    </button>
  )
}
