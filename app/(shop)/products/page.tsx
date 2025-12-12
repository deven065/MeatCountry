import { supabaseServer } from '@/lib/supabase/server'
import ProductGrid from '@/components/product-grid'
import { Product } from '@/lib/types'
import Image from 'next/image'

export const metadata = { title: 'Products — MeatCountry' }

const subCategories = [
  { label: 'All', value: 'all' },
  { label: 'Curry Cuts', value: 'curry' },
  { label: 'Boneless & Mince', value: 'boneless' },
  { label: 'Speciality Cuts', value: 'special' },
  { label: 'Offals', value: 'offal' },
  { label: 'Combos', value: 'combo' },
  { label: 'Premium Cuts', value: 'premium' }
]

export default async function ProductsPage({ searchParams = {} as Record<string, string | string[] | undefined> }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const categoryRaw = Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category ?? ''
  const subRaw = Array.isArray(searchParams.sub) ? searchParams.sub[0] : searchParams.sub ?? ''

  const category = categoryRaw.toLowerCase()
  const sub = (subRaw || 'all').toLowerCase()

  const sb = supabaseServer()
  const { data } = await sb.from('products').select('*').order('name')
  let products = (data ?? []) as Product[]

  if (category) {
    products = products.filter((p) =>
      p.slug.toLowerCase().includes(category) || p.name.toLowerCase().includes(category)
    )
  }

  if (sub && sub !== 'all') {
    products = products.filter((p) =>
      p.slug.toLowerCase().includes(sub) || p.name.toLowerCase().includes(sub)
    )
  }

  const title = category ? `${category.charAt(0).toUpperCase()}${category.slice(1)} Cuts` : 'All Products'

  return (
    <div className="py-8 space-y-10">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-brand-50 via-white to-accent-50">
        <div className="absolute inset-0 opacity-70">
          {category === 'chicken' ? (
            <Image src="/chicken.avif" alt="Chicken hero" fill className="object-cover" priority />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/60" />
        </div>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-10">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-brand-600 font-semibold">Fresh. Juicy. Delivered Cold.</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900">{title}</h1>
            <p className="text-neutral-700 max-w-xl">
              Hand-trimmed, 0-4°C cold-chain maintained, cut by expert butchers. Honest pricing in INR with same-day delivery windows.
            </p>
            <div className="flex flex-wrap gap-3">
              {['0-4°C Cold Chain', 'Chef-grade cuts', 'No water injection'].map((pill) => (
                <span key={pill} className="inline-flex items-center gap-2 rounded-full bg-white/90 border px-4 py-2 text-sm font-medium text-neutral-800 shadow-soft">
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end">
            <div className="bg-white/90 border shadow-card rounded-2xl p-4 flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500" />
              <div>
                <p className="text-sm text-neutral-600">Available today</p>
                <p className="text-xl font-bold text-neutral-900">{products.length} items</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {subCategories.map((item) => {
              const active = sub === item.value
              const query = new URLSearchParams({ ...(category ? { category } : {}), ...(item.value !== 'all' ? { sub: item.value } : {}) }).toString()
              return (
                <Link
                  key={item.value}
                  href={`/products${query ? `?${query}` : ''}`}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${active ? 'bg-brand-600 text-white border-brand-600 shadow-soft' : 'bg-white text-neutral-700 hover:border-brand-200'}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span className="font-semibold text-neutral-800">{products.length}</span> items available
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-700">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-2 shadow-soft">Same-day slots</div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-2 shadow-soft">Hygienic pack</div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-2 shadow-soft">No antibiotic residue</div>
        </div>

        <ProductGrid products={products} />
      </section>
    </div>
  )
}
