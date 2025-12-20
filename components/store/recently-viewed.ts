import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type RecentProduct = {
  id: string
  name: string
  slug: string
  image: string
  price_inr: number
  unit: string
  rating: number
  viewedAt: number
}

type RecentlyViewedState = {
  products: RecentProduct[]
  addProduct: (product: Omit<RecentProduct, 'viewedAt'>) => void
  getRecentProducts: (limit?: number) => RecentProduct[]
  clearHistory: () => void
}

const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      products: [],
      
      addProduct: (product) => {
        const { products } = get()
        const existingIndex = products.findIndex(p => p.id === product.id)
        
        let newProducts = [...products]
        
        // Remove if already exists
        if (existingIndex !== -1) {
          newProducts.splice(existingIndex, 1)
        }
        
        // Add to beginning with timestamp
        newProducts.unshift({
          ...product,
          viewedAt: Date.now()
        })
        
        // Keep only last 20 products
        newProducts = newProducts.slice(0, 20)
        
        set({ products: newProducts })
      },
      
      getRecentProducts: (limit = 10) => {
        return get().products.slice(0, limit)
      },
      
      clearHistory: () => {
        set({ products: [] })
      }
    }),
    {
      name: 'recently-viewed-storage'
    }
  )
)

export default useRecentlyViewed
