"use client"
import { Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabaseClient } from '@/lib/supabase/client'
import useWishlist from './store/wishlist'

type Props = {
  productId: string
  productName: string
  productImage: string
  price: number
  unit: string
  slug: string
}

export default function WishlistButton({ productId, productName, productImage, price, unit, slug }: Props) {
  const { addItem, removeItem, isInWishlist } = useWishlist()
  const [inWishlist, setInWishlist] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    checkAuth()
    setInWishlist(isInWishlist(productId))
  }, [productId])

  const checkAuth = async () => {
    const sb = supabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    setUser(user)
  }

  const toggleWishlist = async () => {
    if (!user) {
      alert('Please sign in to add items to your wishlist')
      return
    }

    setSyncing(true)
    const newState = !inWishlist

    try {
      if (newState) {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId })
        })

        if (response.ok) {
          addItem({
            id: crypto.randomUUID(),
            productId,
            name: productName,
            image: productImage,
            price_inr: price,
            unit,
            slug
          })
          setInWishlist(true)
        } else {
          const data = await response.json()
          alert(data.error || 'Failed to add to wishlist')
        }
      } else {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?product_id=${productId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          removeItem(productId)
          setInWishlist(false)
        } else {
          alert('Failed to remove from wishlist')
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      alert('Failed to update wishlist')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <motion.button
      onClick={toggleWishlist}
      disabled={syncing}
      whileTap={{ scale: 0.9 }}
      className={`p-2 rounded-full transition-colors ${
        inWishlist
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      } disabled:opacity-50`}
    >
      <Heart
        className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`}
      />
    </motion.button>
  )
}
