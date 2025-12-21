"use client"
import { useEffect } from 'react'
import { Product } from '@/lib/types'
import useRecentlyViewed from './store/recently-viewed'

type Props = {
  product: Product
  image: string
  price?: number
  unit?: string
}

export default function ProductViewTracker({ product, image, price, unit }: Props) {
  const { addProduct } = useRecentlyViewed()

  useEffect(() => {
    addProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: image,
      price_inr: price || product.price_inr,
      unit: unit || product.unit,
      rating: product.rating
    })
  }, [product.id, price, unit])

  return null
}
