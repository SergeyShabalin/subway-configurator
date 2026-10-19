const ArrowIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: 28,
        height: 28,
        color: 'var(--text-secondary)',
        flexShrink: 0,
      }}
    >
      <path
        d="M12 5V19M12 19L6 13M12 19L18 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export { ArrowIcon }
