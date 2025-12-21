"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import useRecentlyViewed from './store/recently-viewed'
import Price from './price'
import Rating from './rating'
import { supabaseClient } from '@/lib/supabase/client'

export default function RecentlyViewedProducts() {
  const { getRecentProducts } = useRecentlyViewed()
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const loadProducts = async () => {
      const recentProducts = getRecentProducts(6)
      
      // Fix products with price 0 by loading their first variant
      const fixedProducts = await Promise.all(
        recentProducts.map(async (product) => {
          if (product.price_inr === 0) {
            const sb = supabaseClient()
            const { data: variants } = await sb
              .from('product_variants')
              .select('price_inr, unit')
              .eq('product_id', product.id)
              .order('sort_order', { ascending: true })
              .limit(1)
            
            if (variants && variants[0]) {
              return {
                ...product,
                price_inr: variants[0].price_inr,
                unit: variants[0].unit
              }
            }
          }
          return product
        })
      )
      
      setProducts(fixedProducts)
    }
    
    loadProducts()
  }, [])

  if (products.length === 0) return null

  return (
    <section className="py-12 bg-neutral-50">
      <div className="container-responsive">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-brand-600" />
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
            Recently Viewed
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/products/${product.slug}`}>
                <div className="group bg-white rounded-xl border border-neutral-200 hover:border-brand-300 overflow-hidden transition-all duration-300 hover:shadow-hover">
                  <div className="relative aspect-square overflow-hidden bg-neutral-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-500">{product.unit}</p>
                    <Rating value={product.rating} size="sm" />
                    <Price value={product.price_inr} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
