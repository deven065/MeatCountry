import { supabaseServer } from '@/lib/supabase/server'
import ProductGrid from '@/components/product-grid'
import { Product } from '@/lib/types'
import CategoryGrid from '@/components/category-grid'
import PromoBanner from '@/components/promo-banner'
import RecentlyViewedProducts from '@/components/recently-viewed'
import PersonalizedRecommendations from '@/components/personalized-recommendations'

export default async function HomePage() {
  const sb = supabaseServer()
  const { data } = await sb.from('products').select('*').eq('is_featured', true).limit(8)
  const products = (data ?? []) as Product[]

  const { data: allProductsData } = await sb.from('products').select('*')
  const allProducts = (allProductsData ?? []) as Product[]

  return (
    <div className="py-6 space-y-12">
      <PromoBanner />
      <CategoryGrid />
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Bestsellers at Special Prices</h2>
            <p className="text-neutral-600 mt-1">Limited-time deals on customer favorites</p>
          </div>
        </div>
        <ProductGrid products={products} />
      </section>
      <RecentlyViewedProducts />
      <PersonalizedRecommendations allProducts={allProducts} />
    </div>
  )
}
