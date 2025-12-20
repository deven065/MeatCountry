import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Wishlist — MeatCountry',
  description: 'Your saved favorite products'
}

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
