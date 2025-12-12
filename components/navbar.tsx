"use client"
import Link from 'next/link'
import { ShoppingCart, LogIn, LogOut, User, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import useCart from '@/components/store/cart'
import { motion } from 'framer-motion'

export default function Navbar() {
  const cartCount = useCart((s) => s.items.reduce((a, b) => a + b.quantity, 0))
  const [authed, setAuthed] = useState(false)
  useEffect(() => {
    const sb = supabaseClient()
    sb.auth.getUser().then((r) => setAuthed(!!r.data.user))
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b shadow-soft">
      <div className="container-responsive h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            MeatCountry
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/products" className="hover:text-brand-600 transition-colors">Products</Link>
            <Link href="/products" className="hover:text-brand-600 transition-colors">Categories</Link>
            <Link href="/cart" className="hover:text-brand-600 transition-colors">Cart</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative inline-flex items-center gap-2 hover:text-brand-600 transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <motion.span 
                key={cartCount} 
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>
          {authed ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="hidden md:inline-flex items-center gap-2 text-sm font-medium hover:text-brand-600 transition-colors">
                <User className="h-4 w-4" />
              </Link>
              <button
                onClick={async () => { await supabaseClient().auth.signOut(); setAuthed(false) }}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 px-3 py-2 text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <Link href="/sign-in" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium transition-colors">
              <LogIn className="h-4 w-4" />
              <span className="hidden md:inline">Sign in</span>
            </Link>
          )}
          <button className="md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
