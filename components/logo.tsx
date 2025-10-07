export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
        <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" opacity="0.7" />
      </svg>
      <span className="text-lg font-bold tracking-tight">
        NOTE <span className="text-primary">MEMBERS</span>
      </span>
    </div>
  )
}
