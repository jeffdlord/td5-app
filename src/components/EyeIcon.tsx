export function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="11" rx="6" ry="7" />
      <circle cx="12" cy="9" r="3" />
    </svg>
  )
}
