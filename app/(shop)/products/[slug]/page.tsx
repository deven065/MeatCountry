'use client'
import { supabaseClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'
import Price from '@/components/price'
import Rating from '@/components/rating'
import AddToCart from '@/components/add-to-cart'
import ProductReviews from '@/components/product-reviews'
import ProductViewTracker from '@/components/product-view-tracker'
import PersonalizedRecommendations from '@/components/personalized-recommendations'
import { useEffect, useState, use } from 'react'
import { Tag, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      const sb = supabaseClient()
      
      // Load product
      const { data: productData } = await sb.from('products').select('*').eq('slug', unwrappedParams.slug).single()
      if (!productData) return
      
      setProduct(productData as Product)
      
      // Load variants
      const { data: variantsData } = await sb
        .from('product_variants')
        .select('*')
        .eq('product_id', productData.id)
        .order('sort_order', { ascending: true })
      
      if (variantsData && variantsData.length > 0) {
        setVariants(variantsData)
        const defaultVariant = variantsData.find(v => v.is_default) || variantsData[0]
        setSelectedVariant(defaultVariant)
      }
      
      // Load all products for recommendations
      const { data: allProductsData } = await sb.from('products').select('*')
      setAllProducts((allProductsData ?? []) as Product[])
      
      setLoading(false)
    }
    
    loadData()
  }, [unwrappedParams.slug])

  if (loading || !product) return <div className="py-20 text-center">Loading...</div>

  const images = product.images && product.images.length > 0 ? product.images : ['/chicken.png']
  const img = images[currentImageIndex]
  const currentPrice = selectedVariant?.price_inr || product.price_inr
  const currentOriginalPrice = selectedVariant?.original_price || product.original_price
  const currentUnit = selectedVariant?.unit || product.unit
  const currentDiscount = selectedVariant?.discount_percentage || product.discount_percentage || 0
  const hasDiscount = currentDiscount > 0

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left - next image
      handleNextImage()
    }
    if (touchStart - touchEnd < -50) {
      // Swipe right - previous image
      handlePrevImage()
    }
  }

  return (
    <div className="space-y-12">
      <ProductViewTracker product={product} image={img} price={currentPrice} unit={currentUnit} />
      
      <div className="py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Main Image with Navigation */}
          <div 
            className="relative group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img 
              src={img} 
              alt={product.name} 
              className="w-full rounded-lg object-cover aspect-[4/3] bg-neutral-100" 
            />
            
            {/* Navigation Buttons for Desktop */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNextImage}
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
          
          {/* Thumbnail Strip */}
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => handleThumbnailClick(i)}
                className={`h-16 w-16 rounded object-cover bg-neutral-100 flex-shrink-0 border-2 transition-all ${
                  i === currentImageIndex 
                    ? 'border-brand-600 ring-2 ring-brand-200' 
                    : 'border-transparent hover:border-brand-300'
                }`}
              >
                <img src={src} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover rounded" />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <Rating value={product.rating} />
          
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="inline-block">
              <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white font-bold px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  <span className="text-lg">{currentDiscount}% OFF</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-baseline gap-3">
            <div className="text-3xl">
              <Price value={currentPrice} />
            </div>
            {currentOriginalPrice && currentOriginalPrice > currentPrice && (
              <span className="text-xl text-neutral-400 line-through">
                ₹{currentOriginalPrice}
              </span>
            )}
          </div>
          
          {/* Variant Selection */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">Select Units:</p>
              <div className="flex flex-wrap gap-2">
                {variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                    }`}
                  >
                    {v.unit}
                  </button>
                ))}
              </div>
              <p className="text-sm text-neutral-600">Current selection: {currentUnit}</p>
            </div>
          )}
          
          <p className="text-neutral-700 leading-relaxed">{product.description}</p>
          <div className="max-w-sm">
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
      </div>
      
      <ProductReviews productId={product.id} productName={product.name} />
      
      <PersonalizedRecommendations allProducts={allProducts} currentProductId={product.id} />
    </div>
  )
}
