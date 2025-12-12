"use client"
import Link from 'next/link'
import { Product } from '@/lib/types'
import Price from '@/components/price'
import Rating from '@/components/rating'
import AddToCart from '@/components/add-to-cart'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { Clock } from 'lucide-react'

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0] || '/placeholder.svg'
  const discount = Math.floor(Math.random() * 30) + 10 // Mock discount %
  
  return (
    <motion.div variants={fadeInUp}>
      <div className="group bg-white rounded-xl border border-neutral-200 hover:border-brand-300 overflow-hidden transition-all duration-300 hover:shadow-hover">
        <Link href={`/products/${product.slug}`} className="block relative">
          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-50">
            <img 
              src={img} 
              alt={product.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
            />
            {discount && (
              <div className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded">
                {discount}% OFF
              </div>
            )}
          </div>
        </Link>
        <div className="p-3 space-y-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-neutral-500">{product.unit}</p>
          <div className="flex items-center gap-2">
            <Rating value={product.rating} />
          </div>
          <div className="flex items-baseline gap-2">
            <Price value={product.price_inr} />
            <span className="text-xs text-neutral-400 line-through">
              ₹{Math.floor(product.price_inr / (1 - discount / 100))}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Clock className="h-3 w-3" />
            <span>Today 6AM - 8AM</span>
          </div>
          <AddToCart 
            id={product.id} 
            name={product.name} 
            price_inr={product.price_inr} 
            image={img} 
            unit={product.unit} 
            slug={product.slug} 
          />
        </div>
      </div>
    </motion.div>
  )
}
