"use client"
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/lib/types'

type CartState = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
}

const useCart = create<CartState>()(persist((set, get) => ({
  items: [],
  add: (item) => {
    const existing = get().items.find((i) => i.id === item.id)
    if (existing) {
      set({ items: get().items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i) })
    } else {
      set({ items: [...get().items, item] })
    }
  },
  remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  setQty: (id, qty) => set({ items: get().items.map((i) => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i) }),
  clear: () => set({ items: [] })
}), { name: 'meat-country-cart' }))

export default useCart
