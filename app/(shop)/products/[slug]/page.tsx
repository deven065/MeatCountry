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
import { Tag } from 'lucide-react'

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  const img = product.images?.[0] || '/chicken.png'
  const currentPrice = selectedVariant?.price_inr || product.price_inr
  const currentOriginalPrice = selectedVariant?.original_price || product.original_price
  const currentUnit = selectedVariant?.unit || product.unit
  const currentDiscount = selectedVariant?.discount_percentage || product.discount_percentage || 0
  const hasDiscount = currentDiscount > 0

  return (
    <div className="space-y-12">
      <ProductViewTracker product={product} image={img} />
      
      <div className="py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={img} alt={product.name} className="w-full rounded-lg object-cover aspect-[4/3] bg-neutral-100" />
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {(product.images || []).map((src, i) => (
              <img key={i} src={src} alt="thumb" className="h-16 w-16 rounded object-cover bg-neutral-100" />
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
