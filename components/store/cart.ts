"use client"
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/lib/types'

type CartState = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string, variantId?: string) => void
  setQty: (id: string, qty: number, variantId?: string) => void
  clear: () => void
}

const useCart = create<CartState>()(persist((set, get) => ({
  items: [],
  add: (item) => {
    // Create unique key based on product id and variant id
    const itemKey = item.variant_id ? `${item.id}-${item.variant_id}` : item.id
    const existing = get().items.find((i) => {
      const existingKey = i.variant_id ? `${i.id}-${i.variant_id}` : i.id
      return existingKey === itemKey
    })
    
    if (existing) {
      set({ items: get().items.map((i) => {
        const existingKey = i.variant_id ? `${i.id}-${i.variant_id}` : i.id
        return existingKey === itemKey ? { ...i, quantity: i.quantity + item.quantity } : i
      }) })
    } else {
      set({ items: [...get().items, item] })
    }
  },
  remove: (id, variantId) => {
    const itemKey = variantId ? `${id}-${variantId}` : id
    set({ items: get().items.filter((i) => {
      const existingKey = i.variant_id ? `${i.id}-${i.variant_id}` : i.id
      return existingKey !== itemKey
    }) })
  },
  setQty: (id, qty, variantId) => {
    const itemKey = variantId ? `${id}-${variantId}` : id
    
    // If quantity is 0 or less, remove the item
    if (qty <= 0) {
      set({ items: get().items.filter((i) => {
        const existingKey = i.variant_id ? `${i.id}-${i.variant_id}` : i.id
        return existingKey !== itemKey
      }) })
    } else {
      set({ items: get().items.map((i) => {
        const existingKey = i.variant_id ? `${i.id}-${i.variant_id}` : i.id
        return existingKey === itemKey ? { ...i, quantity: qty } : i
      }) })
    }
  },
  clear: () => set({ items: [] })
}), { name: 'meat-country-cart' }))

export default useCart
