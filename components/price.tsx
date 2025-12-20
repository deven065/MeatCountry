import { formatINR } from '@/lib/currency'

export default function Price({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  }
  return <span className={`font-semibold ${sizeClasses[size]}`}>{formatINR(value)}</span>
}
