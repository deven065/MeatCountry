import { supabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Product } from '@/lib/types'
import Price from '@/components/price'
import Rating from '@/components/rating'
import AddToCart from '@/components/add-to-cart'
import ProductReviews from '@/components/product-reviews'
import ProductViewTracker from '@/components/product-view-tracker'
import PersonalizedRecommendations from '@/components/personalized-recommendations'

type Props = { params: { slug: string } }

export default async function ProductDetailPage({ params }: Props) {
  const sb = supabaseServer()
  const { data } = await sb.from('products').select('*').eq('slug', params.slug).single()
  if (!data) return notFound()
  const product = data as Product
  const img = product.images?.[0] || '/placeholder.svg'

  // Get all products for recommendations
  const { data: allProductsData } = await sb.from('products').select('*')
  const allProducts = (allProductsData ?? []) as Product[]

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
          <Price value={product.price_inr} />
          <p className="text-sm text-neutral-700">{product.unit}</p>
          <p className="text-neutral-700 leading-relaxed">{product.description}</p>
          <div className="max-w-sm">
            <AddToCart id={product.id} name={product.name} price_inr={product.price_inr} image={img} unit={product.unit} slug={product.slug} />
          </div>
        </div>
      </div>
      
      <ProductReviews productId={product.id} productName={product.name} />
      
      <PersonalizedRecommendations allProducts={allProducts} currentProductId={product.id} />
    </div>
  )
}
