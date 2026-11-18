import type { IconProps } from '../types'

export function OrderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 8h11M4 14h11M4 20h11M21 6v16M18 9l3-3 3 3M18 19l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
