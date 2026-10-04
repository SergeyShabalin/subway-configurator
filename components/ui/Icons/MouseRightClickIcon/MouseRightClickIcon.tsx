interface MouseRightClickIconProps {
  className?: string
  size?: number | string
}

export const MouseRightClickIcon = ({ className, size }: MouseRightClickIconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="7" y="2" width="10" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="2" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="14.5" cy="6" r="1.6" fill="#38bdf8" />
  </svg>
)
