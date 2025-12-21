import { supabaseServer } from '@/lib/supabase/server'
import ProductGrid from '@/components/product-grid'
import { Product } from '@/lib/types'
import CategoryGrid from '@/components/category-grid'
import PromoBanner from '@/components/promo-banner'
import RecentlyViewedProducts from '@/components/recently-viewed'
import PersonalizedRecommendations from '@/components/personalized-recommendations'
import Link from 'next/link'

export default async function HomePage() {
  const sb = supabaseServer()
  
  // Fetch featured/bestseller products
  const { data: featuredData } = await sb
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(10)
  const featuredProducts = (featuredData ?? []) as Product[]

  // Fetch all products for recommendations
  const { data: allProductsData } = await sb.from('products').select('*')
  const allProducts = (allProductsData ?? []) as Product[]

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <PromoBanner />
      
      {/* Bestsellers Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Bestsellers</h2>
          <p className="text-gray-600 mt-1">Most popular products near you!</p>
        </div>
        {featuredProducts.length > 0 ? (
          <ProductGrid products={featuredProducts} />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-yellow-800 font-medium">No products added yet!</p>
            <p className="text-yellow-600 text-sm mt-2">Add products from the admin panel to see them here.</p>
          </div>
        )}
      </section>

      {/* What's Cooking Today - Category Circles */}
      <section className="space-y-4 bg-gradient-to-br from-red-50 to-orange-50 -mx-4 px-4 py-8 md:rounded-2xl">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What's cooking today?</h2>
          <p className="text-gray-600 mt-1">Freshest meats and much more!</p>
        </div>
        <CategoryGrid />
      </section>

      {/* Recently Viewed */}
      <RecentlyViewedProducts />

      {/* Personalized Recommendations */}
      <PersonalizedRecommendations allProducts={allProducts} />
      
      {/* Call to Action */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Premium Quality. Honest Prices.</h2>
        <p className="text-red-100 text-lg mb-6 max-w-2xl mx-auto">
          0-4°C cold chain maintained. Expert butchers. Same-day delivery. No water injection.
        </p>
        <Link 
          href="/products" 
          className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
        >
          Browse All Products
        </Link>
      </section>
    </div>
  )
}

