export default function Rating({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const full = Math.floor(value)
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  }
  return (
    <div className={`flex items-center gap-1`}>
      <div className={`text-amber-400 ${sizeClasses[size]}`} aria-label={`Rating ${value} of 5`}>
        {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      </div>
      <span className="text-sm text-neutral-600 font-medium">({value.toFixed(1)})</span>
    </div>
  )
}
