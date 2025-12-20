import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type WishlistItem = {
  id: string
  productId: string
  name: string
  image: string
  price_inr: number
  unit: string
  slug: string
}

type WishlistState = {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get()
        if (!items.some(i => i.productId === item.productId)) {
          set({ items: [...items, item] })
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) })
      },
      
      isInWishlist: (productId) => {
        return get().items.some(i => i.productId === productId)
      },
      
      clearWishlist: () => {
        set({ items: [] })
      }
    }),
    {
      name: 'wishlist-storage'
    }
  )
)

export default useWishlist
