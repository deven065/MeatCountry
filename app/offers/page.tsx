import { supabaseServer } from '@/lib/supabase/server'
import ProductGrid from '@/components/product-grid'
import { Product } from '@/lib/types'
import { Percent, Tag, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export const metadata = { 
  title: 'Special Offers - 20% Off | MeatCountry',
  description: 'Get flat 20% off on your first 5 orders. Premium quality meat and seafood at unbeatable prices.'
}

export default async function OffersPage() {
  const sb = supabaseServer()
  const { data } = await sb.from('products').select('*').order('name')
  
  // Get featured products or all products for the offer
  let products = (data ?? []) as Product[]
  
  // Calculate discounted prices (20% off)
  const discountedProducts = products.map(product => ({
    ...product,
    original_price: product.price_inr,
    price_inr: Math.round(product.price_inr * 0.8) // 20% discount
  }))

  return (
    <div className="py-8 space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-pink-100 via-pink-50 to-white shadow-xl">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-50/90 via-white/70 to-pink-50/90" />
        </div>
        
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              <Percent className="h-4 w-4" />
              LIMITED TIME OFFER
            </div>
            
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-pink-600 mb-2">
                Flat 20% Off
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-pink-700">
                On Your First 5 Orders
              </p>
            </div>
            
            <p className="text-lg text-neutral-700 max-w-xl leading-relaxed">
              Get premium quality chicken, mutton, seafood & more at unbeatable prices. 
              Hand-trimmed cuts, 0-4°C cold-chain maintained, delivered fresh to your door.
            </p>
            
            <div className="flex flex-wrap gap-3">
              {['Free Delivery', 'No Minimum Order', 'Fresh Guarantee'].map((pill) => (
                <span key={pill} className="inline-flex items-center gap-2 rounded-full bg-white/90 border-2 border-pink-200 px-4 py-2 text-sm font-semibold text-pink-700 shadow-soft">
                  <Tag className="h-4 w-4" />
                  {pill}
                </span>
              ))}
            </div>

            <div className="pt-4">
              <div className="bg-white/80 border-2 border-pink-200 rounded-2xl p-4 inline-block">
                <p className="text-sm font-medium text-neutral-600 mb-1">Your Savings</p>
                <div className="flex items-baseline gap-2">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                  <p className="text-3xl font-bold text-green-600">20%</p>
                  <p className="text-sm text-neutral-600">on every product</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center lg:justify-end">
            <div className="bg-white/90 border-2 border-pink-200 shadow-card rounded-3xl p-6 space-y-4 max-w-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-600 mb-2">Offer Valid On</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-pink-50 to-white border-2 border-pink-200 rounded-xl p-4">
                    <p className="text-2xl font-bold text-pink-600">{products.length}</p>
                    <p className="text-xs text-neutral-600 mt-1">Products</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-white border-2 border-pink-200 rounded-xl p-4">
                    <p className="text-2xl font-bold text-pink-600">5</p>
                    <p className="text-xs text-neutral-600 mt-1">Orders</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                <p className="text-xs font-medium text-pink-700 mb-2">How it works:</p>
                <ul className="text-xs text-neutral-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 font-bold">1.</span>
                    Shop your favorite products
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 font-bold">2.</span>
                    Get 20% off at checkout
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 font-bold">3.</span>
                    Valid for first 5 orders
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">All Products with 20% Off</h2>
            <p className="text-neutral-600 mt-1">Premium quality at discounted prices</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-pink-600 text-lg">{products.length}</span> 
            <span className="text-neutral-600">items available</span>
          </div>
        </div>

        <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0">
            <Percent className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900">20% discount automatically applied</p>
            <p className="text-sm text-neutral-600">Prices shown below reflect the discounted amount</p>
          </div>
        </div>

        <ProductGrid products={discountedProducts} />
      </section>

      {/* Terms and Conditions */}
      <section className="bg-neutral-50 border rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-lg text-neutral-900">Terms & Conditions</h3>
        <ul className="text-sm text-neutral-700 space-y-2 list-disc list-inside">
          <li>Offer valid only on your first 5 orders</li>
          <li>20% discount applicable on all products</li>
          <li>Cannot be combined with other offers</li>
          <li>Valid for new and existing customers</li>
          <li>Free delivery on all orders during this promotion</li>
          <li>Standard return and refund policies apply</li>
          <li>MeatCountry reserves the right to modify or cancel this offer at any time</li>
        </ul>
      </section>
    </div>
  )
}
