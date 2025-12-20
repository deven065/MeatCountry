"use client"
import { useEffect } from 'react'
import { Product } from '@/lib/types'
import useRecentlyViewed from './store/recently-viewed'

type Props = {
  product: Product
  image: string
}

export default function ProductViewTracker({ product, image }: Props) {
  const { addProduct } = useRecentlyViewed()

  useEffect(() => {
    addProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: image,
      price_inr: product.price_inr,
      unit: product.unit,
      rating: product.rating
    })
  }, [product.id])

  return null
}
