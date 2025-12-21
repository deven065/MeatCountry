"use client"
import { useState, useEffect } from 'react'
import { X, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Product } from '@/lib/types'
import Price from './price'
import Rating from './rating'
import AddToCart from './add-to-cart'
import WishlistButton from './wishlist-button'
import { supabaseClient } from '@/lib/supabase/client'

type Props = {
  product: Product
}

export default function QuickViewButton({ product }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [variants, setVariants] = useState<any[]>([])
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  
  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder.svg']
  const img = images[currentImageIndex]

  // Load variants when modal opens
  useEffect(() => {
    if (showModal) {
      loadVariants()
    }
  }, [showModal, product.id])

  const loadVariants = async () => {
    const sb = supabaseClient()
    const { data, error } = await sb
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true })
    
    if (!error && data && data.length > 0) {
      setVariants(data)
      const defaultVariant = data.find(v => v.is_default) || data[0]
      setSelectedVariant(defaultVariant)
    }
  }

  // Use selected variant or product default values
  const currentPrice = selectedVariant?.price_inr || product.price_inr
  const currentUnit = selectedVariant?.unit || product.unit

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
  }

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
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowModal(false)
              }}
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
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowModal(false)
                    }}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-neutral-600" />
                  </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Images */}
                  <div className="space-y-4">
                    <div 
                      className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 group"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Navigation Buttons */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handlePrevImage()
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleNextImage()
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </button>
                          
                          {/* Image Counter */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </div>
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {images.map((image, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleThumbnailClick(i)
                            }}
                            className={`h-20 w-20 rounded-lg object-cover bg-neutral-100 flex-shrink-0 border-2 transition-all ${
                              i === currentImageIndex 
                                ? 'border-brand-600 ring-2 ring-brand-200' 
                                : 'border-transparent hover:border-brand-300'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${product.name} ${i + 1}`}
                              className="h-full w-full object-cover rounded-lg"
                            />
                          </button>
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
                          {currentUnit}
                        </span>
                      </div>
                      <Price value={currentPrice} size="lg" />
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
                        price_inr={currentPrice}
                        image={img}
                        unit={currentUnit}
                        slug={product.slug}
                        variant_id={selectedVariant?.id}
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
