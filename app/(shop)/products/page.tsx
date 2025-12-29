import { supabaseServer } from '@/lib/supabase/server'
import ProductsWithFilters from '@/components/products-with-filters'
import { Product, Category } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = { title: 'Products — MeatCountry' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

const subCategories = [
  { label: 'All', value: 'all' },
  { label: 'Curry Cuts', value: 'curry' },
  { label: 'Boneless & Mince', value: 'boneless' },
  { label: 'Speciality Cuts', value: 'special' },
  { label: 'Offals', value: 'offal' },
  { label: 'Combos', value: 'combo' },
  { label: 'Premium Cuts', value: 'premium' }
]

export default async function ProductsPage(props: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams || {}
  const categoryRaw = Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category ?? ''
  const subRaw = Array.isArray(searchParams.sub) ? searchParams.sub[0] : searchParams.sub ?? ''

  const category = categoryRaw.toLowerCase()
  const sub = (subRaw || 'all').toLowerCase()

  const sb = await supabaseServer()
  const { data } = await sb.from('products').select('*').order('name')
  let products = (data ?? []) as Product[]

  const { data: categoriesData } = await sb.from('categories').select('*')
  const categories = (categoriesData ?? []) as Category[]

  const { data: subcategoriesData } = await sb.from('subcategories').select('*')
  const subcategories = (subcategoriesData ?? []) as Array<{ id: string; name: string; slug: string; category_id: string }>

  console.log('All products:', products.length, products.map(p => ({ name: p.name, category_id: p.category_id, price: p.price_inr, images: p.images })))
  console.log('All categories:', categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })))
  console.log('Category parameter:', category)
  console.log('Products without category_id:', products.filter(p => !p.category_id).map(p => p.name))

  // Apply search filter
  const searchQuery = Array.isArray(searchParams.search) ? searchParams.search[0] : searchParams.search
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    products = products.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.slug.toLowerCase().includes(query)
    )
  }

  let selectedCategory: Category | undefined

  // Filter by category - handle both ID and slug
  if (category) {
    // Check if it's a UUID (category ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category)
    
    console.log('Is UUID?', isUUID)
    
    if (isUUID) {
      // Direct ID match - only include products with matching category_id
      const beforeFilter = products.length
      products = products.filter((p) => p.category_id && p.category_id === category)
      console.log('Filtered by category ID:', category, 'Before:', beforeFilter, 'After:', products.length)
      console.log('Filtered products:', products.map(p => ({ name: p.name, category_id: p.category_id })))
      selectedCategory = categories.find(c => c.id === category)
    } else {
      // Match by slug or name
      const matchingCategory = categories.find(c => 
        c.slug.toLowerCase() === category.toLowerCase() || 
        c.name.toLowerCase() === category.toLowerCase()
      )
      
      console.log('Matching category:', matchingCategory)
      
      if (matchingCategory) {
        products = products.filter((p) => p.category_id && p.category_id === matchingCategory.id)
        selectedCategory = matchingCategory
      } else {
        // Fallback to name/slug matching in product
        products = products.filter((p) =>
          p.slug.toLowerCase().includes(category) || p.name.toLowerCase().includes(category)
        )
      }
    }
  }

  console.log('Final filtered products:', products.length)

  // Subcategory filter - use subcategory_id for accurate filtering
  if (sub && sub !== 'all') {
    // Find matching subcategory by slug
    const matchingSubcategory = subcategories.find(s => 
      s.slug.toLowerCase() === sub.toLowerCase() ||
      s.slug.toLowerCase().replace(/-/g, '_') === sub.toLowerCase() ||
      s.slug.toLowerCase().replace(/_/g, '-') === sub.toLowerCase()
    )
    
    console.log('Subcategory filter:', sub, 'Found:', matchingSubcategory)
    
    if (matchingSubcategory) {
      // Filter by subcategory_id
      products = products.filter((p) => p.subcategory_id === matchingSubcategory.id)
      console.log('Filtered by subcategory_id:', matchingSubcategory.id, 'Products:', products.length)
    } else {
      // Fallback to name/slug matching if no subcategory found
      products = products.filter((p) => {
        const slugMatch = p.slug.toLowerCase().includes(sub.toLowerCase())
        const nameMatch = p.name.toLowerCase().includes(sub.toLowerCase())
        return slugMatch || nameMatch
      })
    }
  }

  const title = searchQuery 
    ? `Search results for "${searchQuery}"`
    : selectedCategory
    ? `${selectedCategory.name}` 
    : category
    ? `${category.charAt(0).toUpperCase()}${category.slice(1)} Cuts` 
    : 'All Products'

  return (
    <div className="py-8 space-y-10">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-brand-50 via-white to-accent-50">
        <div className="absolute inset-0">
          {category === 'chicken' ? (
            <Image src="/chicken.avif" alt="Chicken hero" fill className="object-cover" priority />
          ) : sub === 'farm-chicken' || sub === 'farm_chicken' ? (
            <Image src="/chicken.avif" alt="Farm Chicken hero" fill className="object-cover" priority />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/50 to-white/40" />
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
              const href = `/products${query ? `?${query}` : ''}` as any
              return (
                <Link
                  key={item.value}
                  href={href}
                  scroll={true}
                  prefetch={false}
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

        <ProductsWithFilters key={`${category}-${sub}-${products.length}`} products={products} categories={categories} />
      </section>
    </div>
  )
}
