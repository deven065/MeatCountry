"use client"
import { useState, useMemo, useCallback } from 'react'
import { Product } from '@/lib/types'
import ProductGrid from './product-grid'
import ProductFilters from './product-filters'

type FilterState = {
  priceRange: [number, number]
  categories: string[]
  rating: number | null
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular'
}

type Props = {
  products: Product[]
  categories: { id: string; name: string }[]
}

export default function ProductsWithFilters({ products, categories }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    categories: [],
    rating: null,
    sortBy: 'popular'
  })

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by price range
    filtered = filtered.filter(
      p => p.price_inr >= filters.priceRange[0] && p.price_inr <= filters.priceRange[1]
    )

    // Filter by rating
    if (filters.rating !== null) {
      filtered = filtered.filter(p => p.rating >= filters.rating!)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return b.price_inr - a.price_inr
        case 'price-desc':
          return a.price_inr - b.price_inr
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          // Assuming newer products have higher IDs
          return b.id.localeCompare(a.id)
        case 'popular':
        default:
          // Featured first, then by rating
          if (a.is_featured && !b.is_featured) return -1
          if (!a.is_featured && b.is_featured) return 1
          return b.rating - a.rating
      }
    })

    return filtered
  }, [products, filters])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <ProductFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={categories}
        />
      </div>
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-neutral-600 font-medium">
            Showing <span className="text-brand-600 font-bold">{filteredAndSortedProducts.length}</span> of{' '}
            <span className="font-semibold">{products.length}</span> products
          </p>
        </div>
        <ProductGrid products={filteredAndSortedProducts} />
      </div>
    </div>
  )
}
