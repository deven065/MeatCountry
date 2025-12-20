"use client"
import { useEffect, useState } from 'react'
import { X, Scale } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import useCompare from '@/components/store/compare'
import Price from '@/components/price'
import Rating from '@/components/rating'
import AddToCart from '@/components/add-to-cart'

export default function ComparePage() {
  const { products, removeFromCompare, clearCompare } = useCompare()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="py-12">
        <div className="container-responsive">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-96 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="py-20">
        <div className="container-responsive text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto space-y-6"
          >
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
              <Scale className="h-12 w-12 text-neutral-400" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">No Products to Compare</h1>
            <p className="text-neutral-600">
              Add products to comparison to see them side by side
            </p>
            <Link
              href="/products"
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Products
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  const features = [
    { label: 'Product Name', key: 'name' },
    { label: 'Price', key: 'price_inr' },
    { label: 'Unit Size', key: 'unit' },
    { label: 'Rating', key: 'rating' },
    { label: 'Description', key: 'description' }
  ]

  return (
    <div className="py-12">
      <div className="container-responsive space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Compare Products</h1>
            <p className="text-neutral-600">
              Comparing {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>
          {products.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="p-4 text-left font-semibold text-neutral-900 w-48">Feature</th>
                  {products.map((product) => (
                    <th key={product.id} className="p-4 w-64">
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 mb-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Product Name */}
                <tr className="border-b">
                  <td className="p-4 font-semibold text-neutral-700 bg-neutral-50">Product Name</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      <Link
                        href={`/products/${product.slug}`}
                        className="font-semibold text-neutral-900 hover:text-brand-600 transition-colors"
                      >
                        {product.name}
                      </Link>
                    </td>
                  ))}
                </tr>

                {/* Price */}
                <tr className="border-b bg-neutral-50/50">
                  <td className="p-4 font-semibold text-neutral-700 bg-neutral-50">Price</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      <Price value={product.price_inr} />
                    </td>
                  ))}
                </tr>

                {/* Unit Size */}
                <tr className="border-b">
                  <td className="p-4 font-semibold text-neutral-700 bg-neutral-50">Unit Size</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-neutral-700">
                      {product.unit}
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="border-b bg-neutral-50/50">
                  <td className="p-4 font-semibold text-neutral-700 bg-neutral-50">Rating</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      <Rating value={product.rating} />
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr className="border-b">
                  <td className="p-4 font-semibold text-neutral-700 bg-neutral-50">Description</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      <p className="text-sm text-neutral-700 line-clamp-3">
                        {product.description}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Add to Cart */}
                <tr className="bg-neutral-50/50">
                  <td className="p-4 font-semibold text-neutral-700 bg-neutral-50">Action</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      <AddToCart
                        id={product.id}
                        name={product.name}
                        price_inr={product.price_inr}
                        image={product.image}
                        unit={product.unit}
                        slug={product.slug}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Info */}
        {products.length < 4 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800 font-medium">
              You can add up to {4 - products.length} more {products.length === 3 ? 'product' : 'products'} for comparison
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
