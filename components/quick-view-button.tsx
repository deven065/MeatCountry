"use client"
import { useState } from 'react'
import { X, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Product } from '@/lib/types'
import Price from './price'
import Rating from './rating'
import AddToCart from './add-to-cart'
import WishlistButton from './wishlist-button'

type Props = {
  product: Product
}

export default function QuickViewButton({ product }: Props) {
  const [showModal, setShowModal] = useState(false)
  const img = product.images?.[0] || '/placeholder.svg'

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault()
          setShowModal(true)
        }}
        className="absolute bottom-2 right-2 p-2 bg-white/90 hover:bg-brand-600 hover:text-white text-neutral-600 rounded-full transition-colors shadow-lg opacity-0 group-hover:opacity-100"
        title="Quick View"
      >
        <Eye className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                  <h3 className="text-xl font-bold text-neutral-900">Quick View</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-neutral-600" />
                  </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Images */}
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {product.images && product.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {product.images.map((image, i) => (
                          <img
                            key={i}
                            src={image}
                            alt={`${product.name} ${i + 1}`}
                            className="h-20 w-20 rounded-lg object-cover bg-neutral-100 cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                        {product.name}
                      </h2>
                      <div className="flex items-center gap-3 mb-3">
                        <Rating value={product.rating} />
                        <span className="text-sm text-neutral-500">
                          {product.unit}
                        </span>
                      </div>
                      <Price value={product.price_inr} size="lg" />
                    </div>

                    {product.description && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-neutral-900 mb-2">Description</h4>
                        <p className="text-neutral-700 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    )}

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium text-neutral-700">In Stock</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                        <span className="text-sm font-medium text-neutral-700">Same Day Delivery Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                        <span className="text-sm font-medium text-neutral-700">Fresh Daily</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <AddToCart
                        id={product.id}
                        name={product.name}
                        price_inr={product.price_inr}
                        image={img}
                        unit={product.unit}
                        slug={product.slug}
                      />
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowModal(false)
                            window.location.href = `/products/${product.slug}`
                          }}
                          className="flex-1 px-6 py-3 border-2 border-neutral-300 hover:border-brand-600 text-neutral-700 hover:text-brand-600 font-semibold rounded-lg transition-colors"
                        >
                          View Full Details
                        </button>
                        <WishlistButton
                          productId={product.id}
                          productName={product.name}
                          productImage={img}
                          price={product.price_inr}
                          unit={product.unit}
                          slug={product.slug}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
