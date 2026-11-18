import type { IconProps } from '../types'

export function AlignIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 3.5v2.3M14 10.2v1.6M14 16.2v1.6M14 22.2v2.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="14" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="14" cy="14" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="14" cy="20" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
