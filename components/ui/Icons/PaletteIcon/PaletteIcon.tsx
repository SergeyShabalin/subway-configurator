import type { IconProps } from '../types'

export function PaletteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 3.5C8.2 3.5 3.5 8.2 3.5 14S8.2 24.5 14 24.5h2.2c2.1 0 3.1-2.4 1.8-4-1.1-1.4-.1-3.5 1.7-3.5h.8c2.2 0 4-1.8 4-4 0-5.3-4.7-9.5-10.5-9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="9" cy="11" r="1.2" fill="currentColor" />
      <circle cx="14" cy="8.5" r="1.2" fill="currentColor" />
      <circle cx="19" cy="11" r="1.2" fill="currentColor" />
      <circle cx="8.5" cy="16.5" r="1.2" fill="currentColor" />
    </svg>
  )
}
