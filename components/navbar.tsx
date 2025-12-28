"use client"
import Link from 'next/link'
import { ShoppingCart, LogIn, LogOut, User, Menu, ChevronRight, X, Layers, MapPin, Search, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import useCart from '@/components/store/cart'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { getUserLocation } from '@/lib/location'
import { useRouter } from 'next/navigation'
import AuthModal from '@/components/auth-modal'
import ProfileDropdown from '@/components/profile-dropdown'

interface Subcategory {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  subcategories: Subcategory[]
}

export default function Navbar() {
  const cartCount = useCart((s) => s.items.reduce((a, b) => a + b.quantity, 0))
  const [authed, setAuthed] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [location, setLocation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()

  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata',
    'Pune', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
    'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad',
    'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali',
    'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar',
    'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur'
  ]

  const filteredCities = indianCities.filter(city => 
    city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCitySelect = (city: string) => {
    setLocation(city)
    localStorage.setItem('userLocation', city)
    setShowLocationModal(false)
    setSearchQuery('')
  }

  const handleProductSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (productSearchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(productSearchQuery.trim())}`)
      setProductSearchQuery('')
      setShowSearchResults(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (productSearchQuery.trim().length >= 2) {
        setSearchLoading(true)
        const sb = supabaseClient()
        
        // Fetch products
        const { data: products } = await sb
          .from('products')
          .select('id, name, slug, images, price_inr')
          .or(`name.ilike.%${productSearchQuery}%,description.ilike.%${productSearchQuery}%`)
          .limit(10)
        
        if (products) {
          // For each product, get the default variant price if product price is 0
          const productsWithPrices = await Promise.all(
            products.map(async (product) => {
              if (!product.price_inr || product.price_inr === 0) {
                const { data: variants } = await sb
                  .from('product_variants')
                  .select('price_inr, is_default')
                  .eq('product_id', product.id)
                  .order('sort_order', { ascending: true })
                  .limit(1)
                
                if (variants && variants.length > 0) {
                  return { ...product, price_inr: variants[0].price_inr }
                }
              }
              return product
            })
          )
          
          // Filter out products with 0 or null price and limit to 5
          const validProducts = productsWithPrices
            .filter(p => p.price_inr && p.price_inr > 0)
            .slice(0, 5)
          
          setSearchResults(validProducts)
        } else {
          setSearchResults([])
        }
        
        setShowSearchResults(true)
        setSearchLoading(false)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [productSearchQuery])
  
  useEffect(() => {
    const sb = supabaseClient()
    
    // Load categories and subcategories from database
    const loadCategories = async () => {
      console.log('Loading categories from database...')
      try {
        // Try to load with icon field first
        const catResultWithIcon = await sb
          .from('categories')
          .select('id, name, slug, icon')
          .order('name', { ascending: true })
        
        console.log('Categories query result:', catResultWithIcon)
        
        // If icon field doesn't exist, load without it
        const catResult = catResultWithIcon.error && catResultWithIcon.error.message?.includes('column')
          ? await sb.from('categories').select('id, name, slug').order('name', { ascending: true })
          : catResultWithIcon
          
        if (catResult !== catResultWithIcon) {
          console.log('Icon column not found, loaded without it:', catResult)
        }

        const { data: subcatData, error: subcatError } = await sb
          .from('subcategories')
          .select('id, name, slug, category_id')
          .order('name', { ascending: true })

        console.log('Subcategories query result:', { data: subcatData, error: subcatError })

        if (catResult.data) {
          console.log('Raw categories data:', catResult.data)
          // Map categories with their subcategories
          const categoriesWithSubs = catResult.data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon || '📦',
            subcategories: subcatData?.filter((sub: any) => sub.category_id === cat.id) || []
          }))
          
          console.log('Categories with subcategories:', categoriesWithSubs)
          setCategories(categoriesWithSubs)
        } else {
          console.error('No category data returned')
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
    
    // Check initial auth state
    sb.auth.getUser().then((r) => {
      setAuthed(!!r.data.user)
    })

    // Listen for auth state changes (sign in/sign out)
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      setAuthed(!!session)
      console.log('Auth state changed:', event, !!session)
    })

    // Get user location - prioritize fetching fresh location
    const cachedLocation = localStorage.getItem('userLocation')
    
    console.log('Cached location:', cachedLocation)
    
    // Always try to fetch current location
    getUserLocation()
      .then((locationData) => {
        console.log('Fetched location data:', locationData)
        setLocation(locationData)
        localStorage.setItem('userLocation', locationData)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to get location:', error)
        // Fall back to cached location or default
        if (cachedLocation) {
          setLocation(cachedLocation)
        } else {
          setLocation('Bangalore|Bangalore')
        }
        setLoading(false)
      })
    
    // Show cached location immediately while fetching
    if (cachedLocation) {
      setLocation(cachedLocation)
      setLoading(false)
    }

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b shadow-soft">
        <div className="container-responsive h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center relative h-12 w-36">
              <Image 
                src="/logo.png" 
                alt="MeatCountry" 
                fill
                className="object-contain"
                priority
              />
            </Link>
            
            {/* Location Display */}
            <button 
              onClick={() => setShowLocationModal(true)}
              className="hidden md:flex items-center gap-2 hover:bg-neutral-50 rounded-lg px-3 py-2 transition-colors"
            >
              <MapPin className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900">
                  {loading && !location ? 'Loading...' : (location?.split('|')[0] || 'Mumbai')}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-[200px]">
                  {location?.split('|')[1] || 'Select your location'}
                </span>
              </div>
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Search Bar */}
            <form onSubmit={handleProductSearch} className="hidden md:block relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search for chicken, mutton, fish..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  onFocus={() => productSearchQuery.trim().length >= 2 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="w-64 pl-10 pr-4 py-1.5 rounded-full border-2 border-neutral-200 focus:border-brand-500 focus:outline-none text-sm bg-white transition-all"
                />
                
                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {showSearchResults && (searchResults.length > 0 || searchLoading) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden z-50"
                    >
                      {searchLoading ? (
                        <div className="p-4 text-center text-neutral-500">Searching...</div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto">
                          {searchResults.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug}`}
                              onClick={() => {
                                setProductSearchQuery('')
                                setShowSearchResults(false)
                              }}
                              className="flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0"
                            >
                              <img
                                src={product.images?.[0] || '/chicken.png'}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm text-neutral-900">{product.name}</p>
                                <p className="text-xs text-brand-600 font-semibold">₹{product.price_inr}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
          <div className="flex items-center gap-4">
            {/* Categories Navigation */}
            <button 
              onClick={() => setShowCategories(true)}
              className="hidden md:inline-flex items-center gap-2 hover:text-brand-600 transition-colors text-sm font-medium"
            >
              <Layers className="h-4 w-4" />
              Categories
            </button>

            <Link href="/cart" className="relative inline-flex items-center gap-2 hover:text-brand-600 transition-colors text-sm font-medium font-heading uppercase">
              <ShoppingCart className="h-5 w-5" />
              Cart
              {cartCount > 0 && (
                <motion.span 
                  key={cartCount} 
                  initial={{ scale: 0.8 }} 
                  animate={{ scale: 1 }} 
                  className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
            {authed ? (
              <ProfileDropdown 
                onLogout={async () => {
                  await supabaseClient().auth.signOut()
                  setAuthed(false)
                }}
              />
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline">Sign in</span>
              </button>
            )}
            <button 
              className="md:hidden"
              onClick={() => setShowCategories(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Categories Sidebar */}
      <AnimatePresence>
        {showCategories && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCategories(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Categories Panel */}
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-5xl bg-white z-50 shadow-2xl overflow-hidden flex"
            >
              <div className="w-full md:w-96 bg-gradient-to-b from-neutral-50 to-white border-r overflow-y-auto">
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b p-6 flex items-center justify-between shadow-sm z-10">
                  <div>
                    <h2 className="text-2xl font-black text-neutral-900">Categories</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">Browse our products</p>
                  </div>
                  <button
                    onClick={() => setShowCategories(false)}
                    className="p-2.5 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-neutral-600" />
                  </button>
                </div>
                
                <div className="p-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      onMouseEnter={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all cursor-pointer group mb-2 ${
                        activeCategory === category.id 
                          ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg scale-[1.02]' 
                          : 'hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all ${
                        activeCategory === category.id
                          ? 'bg-white/20 shadow-inner'
                          : 'bg-gradient-to-br from-neutral-100 to-neutral-200 group-hover:scale-110'
                      }`}>
                        {category.icon}
                      </div>
                      <span className={`flex-1 text-left font-bold text-base ${
                        activeCategory === category.id 
                          ? 'text-white' 
                          : 'text-neutral-700 group-hover:text-brand-600'
                      }`}>
                        {category.name}
                      </span>
                      {category.subcategories.length > 0 && (
                        <ChevronRight className={`h-5 w-5 transition-transform ${
                          activeCategory === category.id 
                            ? 'text-white translate-x-1' 
                            : 'text-neutral-400 group-hover:text-brand-600 group-hover:translate-x-1'
                        }`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories Panel */}
              <div className="hidden md:block flex-1 bg-gradient-to-br from-white to-neutral-50 overflow-y-auto">
                {activeCategory && (() => {
                  const category = categories.find(c => c.id === activeCategory)
                  return category && category.subcategories.length > 0 && (
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-8"
                    >
                      <div className="mb-8">
                        <h3 className="text-3xl font-black text-neutral-900 mb-2">
                          {category.name}
                        </h3>
                        <div className="h-1.5 w-20 bg-gradient-to-r from-brand-500 to-accent-500 rounded-full"></div>
                      </div>
                      
                      <div className="space-y-8">
                        {category.subcategories.map((sub, index) => (
                        <motion.div 
                          key={index} 
                          className="space-y-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={`/products?category=${activeCategory}&sub=${sub.name.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => setShowCategories(false)}
                            prefetch={false}
                            scroll={true}
                            className="inline-flex items-center gap-2 text-lg font-bold text-neutral-800 hover:text-brand-600 transition-colors group"
                          >
                            <span>{sub.name}</span>
                            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  )
                })()}
                
                {!activeCategory && (
                  <div className="flex items-center justify-center h-full text-neutral-400">
                    <div className="text-center">
                      <p className="text-lg font-medium">Select a category to view items</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Location Selection Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLocationModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
              >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Select Your Location</h3>
                  <p className="text-sm text-neutral-600 mt-1">Choose your city for delivery</p>
                </div>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-600" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-4">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search for your city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-brand-500 focus:outline-none text-sm"
                  autoFocus
                />
              </div>

              {/* Cities List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredCities.length > 0 ? (
                  <div className="space-y-1">
                    {filteredCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium text-neutral-700"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <p className="text-sm">No cities found</p>
                  </div>
                )}
              </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode="sign-in"
      />
    </>
  )
}
