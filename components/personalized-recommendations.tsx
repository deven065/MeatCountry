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
    const recentProducts = getRecentProducts(5)
    
    // Get categories from recently viewed products
    const recentCategories = recentProducts
      .map(p => allProducts.find(ap => ap.id === p.id))
      .filter(Boolean)
      .map(p => p!.category_id)
    
    // Find products from same categories
    let recommended = allProducts.filter(p => {
      // Exclude current product
      if (currentProductId && p.id === currentProductId) return false
      
      // Include if same category as recently viewed
      if (recentCategories.includes(p.category_id)) return true
      
      // Include featured products
      if (p.is_featured) return true
      
      // Include highly rated products
      if (p.rating >= 4.5) return true
      
      return false
    })

    // Sort by rating and limit
    recommended.sort((a, b) => b.rating - a.rating)
    recommended = recommended.slice(0, 8)
    
    // If not enough recommendations, add random products
    if (recommended.length < 4) {
      const additional = allProducts
        .filter(p => !recommended.some(r => r.id === p.id) && p.id !== currentProductId)
        .sort(() => Math.random() - 0.5)
        .slice(0, 8 - recommended.length)
      
      recommended = [...recommended, ...additional]
    }
    
    setRecommendations(recommended)
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
          Based on your browsing history and preferences
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
