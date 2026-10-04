interface CloseIconProps {
  className?: string
}

export const CloseIcon = ({ className }: CloseIconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
