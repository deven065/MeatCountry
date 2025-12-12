import { formatINR } from '@/lib/currency'

export default function Price({ value }: { value: number }) {
  return <span className="font-semibold">{formatINR(value)}</span>
}
