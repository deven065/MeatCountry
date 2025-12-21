"use client"
import { motion } from 'framer-motion'
import useCart from '@/components/store/cart'
import { CartItem } from '@/lib/types'
import { Plus, Minus } from 'lucide-react'

export default function AddToCart(props: Omit<CartItem, 'quantity'> & { quantity?: number }) {
  const add = useCart((s) => s.add)
  const setQty = useCart((s) => s.setQty)
  const items = useCart((s) => s.items)
  
  const qty = props.quantity ?? 1
  
  // Find if item is already in cart
  const itemKey = props.variant_id ? `${props.id}-${props.variant_id}` : props.id
  const cartItem = items.find((i) => {
    const existingKey = i.variant_id ? `${i.id}-${i.variant_id}` : i.id
    return existingKey === itemKey
  })
  
  const currentQty = cartItem?.quantity || 0
  
  if (currentQty > 0) {
    return (
      <div className="w-full flex items-center justify-between bg-brand-50 border-2 border-brand-600 rounded-lg px-3 py-2">
        <button
          onClick={() => setQty(props.id, currentQty - 1, props.variant_id)}
          className="text-brand-600 hover:bg-brand-100 rounded-lg p-1.5 transition-colors"
        >
          <Minus className="h-5 w-5" />
        </button>
        <span className="text-brand-600 font-bold text-lg px-4">{currentQty}</span>
        <button
          onClick={() => setQty(props.id, currentQty + 1, props.variant_id)}
          className="text-brand-600 hover:bg-brand-100 rounded-lg p-1.5 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    )
  }
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => add({ ...props, quantity: qty })}
      className="w-full rounded-lg bg-brand-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 transition-colors shadow-soft flex items-center justify-center gap-2"
    >
      <Plus className="h-4 w-4" />
      Add to cart
    </motion.button>
  )
}
