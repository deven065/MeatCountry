"use client"
import { useEffect, useState } from 'react'
import { Heart, ShoppingBag, X } from 'lucide-react'
import { Product } from '@/lib/types'
import Link from 'next/link'
import Price from '@/components/price'
import AddToCart from '@/components/add-to-cart'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      const data = await response.json()
      
      if (response.ok && data.wishlist) {
        setWishlist(data.wishlist)
      } else if (response.status === 401) {
        // User not logged in
        setWishlist([])
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist?product_id=${productId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setWishlist(wishlist.filter(item => item.product_id !== productId))
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
    }
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="container-responsive">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-neutral-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-96 bg-neutral-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="py-20">
        <div className="container-responsive text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto space-y-6"
          >
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-12 w-12 text-neutral-400" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">Your Wishlist is Empty</h1>
            <p className="text-neutral-600">
              Save your favorite products to easily find them later
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              Browse Products
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container-responsive space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Wishlist</h1>
            <p className="text-neutral-600">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {/* Wishlist Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          <AnimatePresence>
            {wishlist.map((item) => {
              const product = item.products
              const img = product.images?.[0] || '/placeholder.svg'
              
              return (
                <motion.div
                  key={item.id}
                  variants={fadeInUp}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                  className="group bg-white rounded-xl border border-neutral-200 hover:border-brand-300 overflow-hidden transition-all duration-300 hover:shadow-hover"
                >
                  <Link href={`/products/${product.slug}`} className="block relative">
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-50">
                      <img
                        src={img}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          removeFromWishlist(item.product_id)
                        }}
                        className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-100 text-neutral-600 hover:text-red-600 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </Link>
                  
                  <div className="p-4 space-y-3">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-neutral-500">{product.unit}</p>
                    <Price value={product.price_inr} />
                    <AddToCart
                      id={product.id}
                      name={product.name}
                      price_inr={product.price_inr}
                      image={img}
                      unit={product.unit}
                      slug={product.slug}
                    />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
