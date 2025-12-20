"use client"
import { useState, useEffect } from 'react'
import { Scale } from 'lucide-react'
import { Product } from '@/lib/types'
import useCompare from './store/compare'

type Props = {
  product: Product
  image: string
}

export default function CompareButton({ product, image }: Props) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare()
  const [inCompare, setInCompare] = useState(false)

  useEffect(() => {
    setInCompare(isInCompare(product.id))
  }, [product.id])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (inCompare) {
      removeFromCompare(product.id)
      setInCompare(false)
    } else {
      addToCompare({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: image,
        price_inr: product.price_inr,
        unit: product.unit,
        rating: product.rating,
        description: product.description,
        category_id: product.category_id
      })
      setInCompare(true)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-colors ${
        inCompare
          ? 'bg-brand-100 text-brand-600 hover:bg-brand-200'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`}
      title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
    >
      <Scale className="h-4 w-4" />
    </button>
  )
}
