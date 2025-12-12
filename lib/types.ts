export type Category = {
  id: string
  name: string
  slug: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  price_inr: number
  unit: string
  inventory: number
  is_featured: boolean
  rating: number
  category_id: string
}

export type CartItem = {
  id: string
  name: string
  price_inr: number
  image: string
  quantity: number
  unit: string
  slug: string
}
