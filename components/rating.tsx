export default function Rating({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const full = Math.round(value)
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  return (
    <div className={`text-amber-500 ${sizeClasses[size]}`} aria-label={`Rating ${value} of 5`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </div>
  )
}
