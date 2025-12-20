import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/lib/types'

type CompareProduct = {
  id: string
  name: string
  slug: string
  image: string
  price_inr: number
  unit: string
  rating: number
  description: string
  category_id: string
}

type CompareState = {
  products: CompareProduct[]
  addToCompare: (product: CompareProduct) => void
  removeFromCompare: (productId: string) => void
  isInCompare: (productId: string) => boolean
  clearCompare: () => void
}

const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      products: [],
      
      addToCompare: (product) => {
        const { products } = get()
        
        if (products.length >= 4) {
          alert('You can compare up to 4 products at a time')
          return
        }
        
        if (products.some(p => p.id === product.id)) {
          alert('Product already added to comparison')
          return
        }
        
        set({ products: [...products, product] })
      },
      
      removeFromCompare: (productId) => {
        set({ products: get().products.filter(p => p.id !== productId) })
      },
      
      isInCompare: (productId) => {
        return get().products.some(p => p.id === productId)
      },
      
      clearCompare: () => {
        set({ products: [] })
      }
    }),
    {
      name: 'compare-storage'
    }
  )
)

export default useCompare
