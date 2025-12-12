"use client"
import { motion } from 'framer-motion'
import useCart from '@/components/store/cart'
import { CartItem } from '@/lib/types'
import { Plus } from 'lucide-react'

export default function AddToCart(props: Omit<CartItem, 'quantity'> & { quantity?: number }) {
  const add = useCart((s) => s.add)
  const qty = props.quantity ?? 1
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
