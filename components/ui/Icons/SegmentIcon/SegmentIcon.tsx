import type { CSSProperties } from 'react'

interface SegmentIconProps {
  color?: string
}

const DEFAULT_COLOR = 'var(--text-secondary)'

const SegmentIcon = ({ color = DEFAULT_COLOR }: SegmentIconProps) => {
  const style: CSSProperties = {
    width: 60,
    height: 28,
    flexShrink: 0,
    color,
  }

  return (
    <svg viewBox="0 0 60 28" fill="none" style={style} aria-hidden="true">
      <circle cx="5" cy="14" r="3.5" stroke="currentColor" strokeWidth="2" />

      <path
        d="M22.4 14 H37.6 M32.6 9 L37.6 14 L32.6 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="55" cy="14" r="3.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export { SegmentIcon }
