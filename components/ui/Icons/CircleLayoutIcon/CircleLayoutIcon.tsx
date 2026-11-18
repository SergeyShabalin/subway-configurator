import type { IconProps } from '../types'

export function CircleLayoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <circle cx="14" cy="14" r="9.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="14" cy="4.5" r="1.7" fill="currentColor" />
      <circle cx="23.5" cy="14" r="1.7" fill="currentColor" />
      <circle cx="14" cy="23.5" r="1.7" fill="currentColor" />
      <circle cx="4.5" cy="14" r="1.7" fill="currentColor" />
    </svg>
  )
}
