import { useId } from 'react'

interface WalkIconProps {
  className?: string
  fromColor?: string
  toColor?: string
  size?: number
}

const FALLBACK_COLOR = '#94a3b8'

export const WalkIcon = ({
  className,
  fromColor = FALLBACK_COLOR,
  toColor = FALLBACK_COLOR,
  size = 24,
}: WalkIconProps) => {
  const gradientId = `walk-gradient-${useId().replace(/:/g, '')}`

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="22">
          <stop offset="0" stopColor={fromColor} />
          <stop offset="1" stopColor={toColor} />
        </linearGradient>
      </defs>

      <circle cx="13" cy="4" r="2" />
      <path d="M10 22l2-6" />
      <path d="M12 16l-2-3 1-5 4 3 3 1" />
      <path d="M11 8l-3 3-3 1" />
      <path d="M12 16l3 2 1 4" />
    </svg>
  )
}
