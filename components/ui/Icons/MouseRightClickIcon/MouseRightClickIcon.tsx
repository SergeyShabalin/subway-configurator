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
    aria-hidden="true"
  >
    <path
      d="M12 2C7.86 2 5 4.86 5 9V15C5 19.14 7.86 22 12 22C16.14 22 19 19.14 19 15V9C19 4.86 16.14 2 12 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M14 3.8V10.8H17.2V9C17.2 6.5 16 4.5 14 3.8Z" fill="#38BDF8" />
    <path d="M12 2.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
