"use client"
import { useState } from 'react'
import useCart from '@/components/store/cart'
import Price from '@/components/price'
import Checkout from '@/components/checkout'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { items, setQty, remove, clear } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)
  const subtotal = items.reduce((a, b) => a + b.price_inr * b.quantity, 0)
  
  if (showCheckout) {
    return (
      <div className="py-10 max-w-4xl mx-auto px-4">
        <button
          onClick={() => setShowCheckout(false)}
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>
        <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
        <Checkout />
      </div>
    )
  }
  
  return (
    <div className="py-10 max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Your Cart</h1>
            <Link href="/products" className="text-sm text-brand-600 hover:text-brand-700">
              Continue Shopping
            </Link>
          </div>
          
          {items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600 mb-4">Your cart is empty.</p>
              <Link 
                href="/products"
                className="inline-block px-6 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
              >
                Shop Now
              </Link>
            </div>
          )}
          
          <div className="space-y-4">
            {items.map((it) => {
              const itemKey = it.variant_id ? `${it.id}-${it.variant_id}` : it.id
              return (
                <div key={itemKey} className="flex items-center gap-4 bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img 
                    src={it.image} 
                    alt={it.name} 
                    className="h-24 w-24 rounded-lg object-cover bg-neutral-100" 
                  />
                  <div className="flex-1">
                    <Link href={`/products/${it.slug}`} className="font-medium hover:text-brand-600">
                      {it.name}
                    </Link>
                    <p className="text-sm text-neutral-500">{it.unit}</p>
                    <div className="mt-1">
                      <Price value={it.price_inr} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border rounded-md">
                      <button 
                        className="h-8 w-8 hover:bg-neutral-100 rounded-l-md transition-colors"
                        onClick={() => setQty(it.id, it.quantity - 1, it.variant_id)}
                      >
                        -
                      </button>
                      <span className="text-sm w-8 text-center font-medium">{it.quantity}</span>
                      <button 
                        className="h-8 w-8 hover:bg-neutral-100 rounded-r-md transition-colors"
                        onClick={() => setQty(it.id, it.quantity + 1, it.variant_id)}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                      onClick={() => remove(it.id, it.variant_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-6 space-y-4 sticky top-4">
            <h2 className="text-lg font-semibold">Cart Summary</h2>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Subtotal ({items.length} items)</span>
                <Price value={subtotal} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Delivery Fee</span>
                {subtotal > 500 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span className="text-neutral-900">₹40</span>
                )}
              </div>
              
              {subtotal < 500 && subtotal > 0 && (
                <div className="text-xs text-neutral-500 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                  Add ₹{(500 - subtotal).toFixed(0)} more to get free delivery
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Total</span>
                <Price value={subtotal + (subtotal > 500 ? 0 : 40)} />
              </div>
            </div>
            
            <button 
              onClick={() => setShowCheckout(true)}
              disabled={items.length === 0}
              className="w-full rounded-md bg-brand-600 text-white px-4 py-3 text-sm font-semibold hover:bg-brand-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
            >
              Proceed to Checkout
            </button>
            
            {items.length > 0 && (
              <button 
                className="w-full text-sm text-neutral-600 hover:text-neutral-900"
                onClick={() => clear()}
              >
                Clear cart
              </button>
            )}
          </div>
          
          {/* Trust Badges */}
          <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>100% Fresh & Hygienic</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Same Day Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
