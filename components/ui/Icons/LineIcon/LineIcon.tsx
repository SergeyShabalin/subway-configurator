type LineIconProps = {
  className?: string
}

export function LineIcon({ className }: LineIconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <path d="M9.7 18.7 L18.3 7.2" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="21" cy="4.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="22" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
