"use client"
import { useEffect, useState } from 'react'
import { Scale, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import useCompare from './store/compare'

export default function CompareFloatingBar() {
  const { products, removeFromCompare } = useCompare()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || products.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-4xl w-full px-4"
      >
        <div className="bg-white rounded-xl shadow-2xl border-2 border-brand-200 p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2 text-brand-600">
                <Scale className="h-6 w-6" />
                <span className="font-bold text-lg">{products.length} to Compare</span>
              </div>
              
              <div className="flex gap-2 overflow-x-auto">
                {products.map((product) => (
                  <div key={product.id} className="relative group">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover border-2 border-neutral-200"
                    />
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/compare"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Compare Now
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
