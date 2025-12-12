export default function Rating({ value }: { value: number }) {
  const full = Math.round(value)
  return (
    <div className="text-amber-500 text-sm" aria-label={`Rating ${value} of 5`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </div>
  )
}
