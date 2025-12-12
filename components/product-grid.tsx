"use client"
import { Product } from '@/lib/types'
import ProductCard from '@/components/product-card'
import { motion } from 'framer-motion'
import { staggerContainer } from '@/lib/animations'

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </motion.div>
  )
}
