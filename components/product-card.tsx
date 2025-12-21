"use client"
import Link from 'next/link'
import { Product } from '@/lib/types'
import Price from '@/components/price'
import Rating from '@/components/rating'
import AddToCart from '@/components/add-to-cart'
import CompareButton from '@/components/compare-button'
import QuickViewButton from '@/components/quick-view-button'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { Clock, Tag } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase/client'

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0] || '/chicken.png'
  const [variants, setVariants] = useState<any[]>([])
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  
  // Load variants
  useEffect(() => {
    const loadVariants = async () => {
      const sb = supabaseClient()
      const { data, error } = await sb
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .order('sort_order', { ascending: true })
      
      console.log(`Variants for ${product.name} (ID: ${product.id}):`, { data, error })
      
      if (!error && data && data.length > 0) {
        setVariants(data)
        const defaultVariant = data.find(v => v.is_default) || data[0]
        setSelectedVariant(defaultVariant)
      }
    }
    
    loadVariants()
  }, [product.id])
  
  // Use selected variant or product default values
  const currentPrice = selectedVariant?.price_inr || product.price_inr
  const currentOriginalPrice = selectedVariant?.original_price || product.original_price
  const currentUnit = selectedVariant?.unit || product.unit
  const currentDiscount = selectedVariant?.discount_percentage || product.discount_percentage || 0
  const hasDiscount = currentDiscount > 0
  
  // Check if all variants are out of stock
  const totalStock = variants.reduce((sum, v) => sum + (v.inventory || 0), 0)
  const isOutOfStock = variants.length > 0 && totalStock === 0
  
  return (
    <motion.div variants={fadeInUp}>
      <div className={`group bg-white rounded-xl border border-neutral-200 hover:border-brand-300 overflow-hidden transition-all duration-300 hover:shadow-hover ${
        isOutOfStock ? 'opacity-60 grayscale' : ''
      }`}>
        <Link href={`/products/${product.slug}`} className="block relative">
          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-50">
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center">
                <div className="bg-red-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg transform rotate-[-5deg]">
                  <span className="text-lg uppercase tracking-wider">Out of Stock</span>
                </div>
              </div>
            )}
            <img 
              src={img} 
              alt={product.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
            />
            {hasDiscount && (
              <div className="absolute top-3 left-3 z-10">
                <div className="relative">
                  {/* Premium discount badge with gradient and shine effect */}
                  <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white font-bold px-3 py-2 rounded-lg shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-4 w-4" />
                      <span className="text-base">{currentDiscount}% OFF</span>
                    </div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shine"></div>
                  </div>
                  {/* Shadow underneath for depth */}
                  <div className="absolute inset-0 bg-red-900/20 blur-md transform translate-y-1"></div>
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              <CompareButton
                product={product}
                image={img}
              />
            </div>
            <QuickViewButton product={product} />
          </div>
        </Link>
        <div className="p-3 space-y-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2">
            <Rating value={product.rating} />
          </div>
          
          {/* Variant Selection - Show as buttons for better UX */}
          {variants.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Select Units:</p>
              <div className="flex flex-wrap gap-1.5">
                {variants.map(v => (
                  <button
                    key={v.id}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedVariant(v)
                    }}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border-2 transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300'
                    }`}
                  >
                    {v.unit}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-baseline gap-2">
            <Price value={currentPrice} />
            {currentOriginalPrice && currentOriginalPrice > currentPrice && (
              <span className="text-xs text-neutral-400 line-through">
                ₹{currentOriginalPrice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Clock className="h-3 w-3" />
            <span>Today 6AM - 8AM</span>
          </div>
          <AddToCart 
            id={product.id} 
            name={product.name} 
            price_inr={currentPrice} 
            image={img} 
            unit={currentUnit} 
            slug={product.slug}
            variant_id={selectedVariant?.id}
          />
        </div>
      </div>
    </motion.div>
  )
}
