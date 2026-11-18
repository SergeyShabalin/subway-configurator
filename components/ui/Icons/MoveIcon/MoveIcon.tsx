import type { IconProps } from '../types'

export function MoveIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 4v20M4 14h20M10.5 7.5 14 4l3.5 3.5M10.5 20.5 14 24l3.5-3.5M7.5 10.5 4 14l3.5 3.5M20.5 10.5 24 14l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
