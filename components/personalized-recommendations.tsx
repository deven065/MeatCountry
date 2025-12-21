"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Product } from '@/lib/types'
import ProductCard from './product-card'
import useRecentlyViewed from './store/recently-viewed'

type Props = {
  allProducts: Product[]
  currentProductId?: string
}

export default function PersonalizedRecommendations({ allProducts, currentProductId }: Props) {
  const { getRecentProducts } = useRecentlyViewed()
  const [recommendations, setRecommendations] = useState<Product[]>([])

  useEffect(() => {
    generateRecommendations()
  }, [allProducts, currentProductId])

  const generateRecommendations = () => {
    // Get today's date as seed for consistent daily recommendations
    const today = new Date()
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    // Seeded random function for consistent daily results
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000
      return x - Math.floor(x)
    }
    
    // Filter out current product
    let availableProducts = allProducts.filter(p => 
      (!currentProductId || p.id !== currentProductId)
    )
    
    // Shuffle products based on daily seed
    const shuffled = availableProducts
      .map((product, index) => ({ product, sort: seededRandom(index) }))
      .sort((a, b) => a.sort - b.sort)
      .map(item => item.product)
    
    // Take first 4 products
    setRecommendations(shuffled.slice(0, 4))
  }

  if (recommendations.length === 0) return null

  return (
    <section className="py-12 bg-gradient-to-br from-brand-50 to-accent-50">
      <div className="container-responsive">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-brand-600" />
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
            Recommended For You
          </h2>
        </div>
        <p className="text-neutral-600 mb-8">
          Fresh picks rotating daily - discover something new every day!
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {recommendations.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
