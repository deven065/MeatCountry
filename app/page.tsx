import { supabaseServer } from '@/lib/supabase/server'
import ProductGrid from '@/components/product-grid'
import { Product } from '@/lib/types'
import CategoryGrid from '@/components/category-grid'
import PromoBanner from '@/components/promo-banner'
import RecentlyViewedProducts from '@/components/recently-viewed'
import PersonalizedRecommendations from '@/components/personalized-recommendations'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const sb = await supabaseServer()
  
  // Fetch featured/bestseller products
  const { data: featuredData } = await sb
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(10)
  const featuredProducts = (featuredData ?? []) as Product[]

  // Fetch fish & seafood products
  const { data: seafoodData } = await sb
    .from('products')
    .select('*')
    .or('category.ilike.%fish%,category.ilike.%seafood%,subcategory.ilike.%fish%,subcategory.ilike.%seafood%')
    .order('created_at', { ascending: false })
    .limit(10)
  const seafoodProducts = (seafoodData ?? []) as Product[]

  // Fetch party menu products (kebabs, wings, starters, ready-to-cook)
  const { data: partyMenuData } = await sb
    .from('products')
    .select('*')
    .or('subcategory.ilike.%kebab%,subcategory.ilike.%wings%,subcategory.ilike.%nugget%,subcategory.ilike.%starter%,subcategory.ilike.%party%,subcategory.ilike.%burger%')
    .order('rating', { ascending: false })
    .limit(10)
  const partyMenuProducts = (partyMenuData ?? []) as Product[]

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

      {/* What's Cooking Today - All Categories */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What's cooking today?</h2>
          <p className="text-gray-600 mt-1">Freshest meats and much more!</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {[
            { name: 'Chicken', image: '/chicken.avif?v=2', slug: 'chicken' },
            { name: 'Our Specials', image: '/chicken.avif?v=2', slug: 'specials' },
            { name: 'Curries and masalas', image: '/chicken.avif?v=2', slug: 'curries' },
            { name: 'Wings & Burger Patty', image: '/chicken%20wings.webp', slug: 'wings-burger' },
            { name: 'Bestsellers', image: '/chicken.avif?v=2', slug: 'bestsellers' },
            { name: 'Friday Fish Market', image: '/Fish.avif', slug: 'fish' },
            { name: 'Kebab & starters', image: '/chicken.avif?v=2', slug: 'kebab-starters' },
            { name: 'Mutton', image: '/Mutton.avif', slug: 'mutton' },
            { name: 'Liver & More', image: '/Mutton.avif', slug: 'liver' },
            { name: 'Prawns & Crabs', image: '/prawns-and-crabs.webp', slug: 'prawns-crabs' },
            { name: 'Eggs', image: '/Egg.avif', slug: 'eggs' },
            { name: 'Crispy Snacks & Wings', image: '/chicken%20wings.webp', slug: 'snacks' },
            { name: 'Cold Cuts', image: '/chicken.avif?v=2', slug: 'cold-cuts' },
            { name: 'Spreads', image: '/chicken.avif?v=2', slug: 'spreads' },
            { name: 'Fish & Seafood', image: '/Fish.avif', slug: 'seafood' },
            { name: 'Combos', image: '/chicken.avif?v=2', slug: 'combos' },
            { name: 'Meat Masala', image: '/chicken.avif?v=2', slug: 'masala' },
            { name: 'Ready to cook', image: '/chicken.avif?v=2', slug: 'ready-to-cook' },
            { name: 'Kebab', image: '/chicken.avif?v=2', slug: 'kebab' },
            { name: 'Party Starters', image: '/chicken.avif?v=2', slug: 'party-starters' },
            { name: 'Weekend Specials', image: '/chicken.avif?v=2', slug: 'weekend-specials' },
          ].map((category) => (
            <Link 
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group flex flex-col items-center space-y-2"
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white shadow-md group-hover:shadow-lg transition-shadow">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <p className="text-xs md:text-sm text-center text-gray-800 font-medium group-hover:text-red-600 transition-colors">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Premium Fish & Seafood Selection */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Premium fish & seafood selection</h2>
            <p className="text-gray-600 mt-1">Same-day catch: fresh & flavourful</p>
          </div>
          <Link 
            href="/products?category=seafood" 
            className="text-red-600 font-semibold hover:text-red-700 transition-colors text-sm md:text-base"
          >
            View All →
          </Link>
        </div>
        {seafoodProducts.length > 0 ? (
          <ProductGrid products={seafoodProducts} />
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-blue-800 font-medium">Fish & Seafood products coming soon!</p>
            <p className="text-blue-600 text-sm mt-2">Add fish and seafood products from the admin panel to see them here.</p>
          </div>
        )}
      </section>

      {/* Festive Party Menu */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Festive Party Menu</h2>
            <p className="text-gray-600 mt-1">Make your seasonal celebrations special</p>
          </div>
          <Link 
            href="/products?category=party-starters" 
            className="text-red-600 font-semibold hover:text-red-700 transition-colors text-sm md:text-base"
          >
            View All →
          </Link>
        </div>
        {partyMenuProducts.length > 0 ? (
          <ProductGrid products={partyMenuProducts} />
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 text-center">
            <p className="text-orange-800 font-medium">Party menu items coming soon!</p>
            <p className="text-orange-600 text-sm mt-2">Add kebabs, wings, nuggets and other party items from the admin panel to see them here.</p>
          </div>
        )}
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

