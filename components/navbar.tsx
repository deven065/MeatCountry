"use client"
import Link from 'next/link'
import { ShoppingCart, LogIn, LogOut, User, Menu, ChevronRight, X, Layers, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import useCart from '@/components/store/cart'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { getUserLocation } from '@/lib/location'

const categories = [
  {
    id: 'poultry',
    name: 'Poultry',
    icon: '🐔',
    subcategories: [
      { 
        name: 'Farm Chicken', 
        items: ['Whole Chicken', 'Curry Cut', 'Breast Boneless', 'Breast with Bone', 'Thigh Boneless', 'Thigh with Bone', 'Wings', 'Keema']
      },
      { 
        name: 'Desi Chicken', 
        items: ['Whole Chicken', 'Curry Cut']
      },
      { 
        name: 'Kadaknath Chicken', 
        items: ['Whole Chicken', 'Curry Cut']
      },
      { 
        name: 'Bater Chicken', 
        items: ['Whole Chicken', 'Curry Cut']
      },
      { 
        name: 'Gini Fowl Chicken', 
        items: ['Whole Chicken', 'Curry Cut']
      },
      { 
        name: 'Turkey Chicken', 
        items: ['Whole Chicken', 'Curry Cut']
      },
      { 
        name: 'Duck Chicken', 
        items: ['Whole Chicken', 'Curry Cut']
      }
    ]
  },
  {
    id: 'ready-to-eat',
    name: 'Ready to eat',
    icon: '🍽️',
    subcategories: [
      { name: 'Sausage', items: [] },
      { name: 'Nuggets', items: [] },
      { name: 'Chicken Balls/Kofta', items: [] },
      { name: 'Patties', items: [] },
      { name: 'Mutton', items: ['Seekh Kabab', 'Shami Kabab'] }
    ]
  },
  {
    id: 'pickle',
    name: 'Pickle',
    icon: '🥒',
    subcategories: [
      { name: 'Chicken Pickle', items: [] },
      { name: 'Mutton Pickle', items: [] },
      { name: 'Fish Pickle', items: [] },
      { name: 'Eggs Pickle', items: [] }
    ]
  },
  {
    id: 'eggs-products',
    name: 'Eggs Products',
    icon: '🥚',
    subcategories: [
      { name: 'Eggs Sausage', items: [] },
      { name: 'Egg Peda', items: [] },
      { name: 'Egg Rasmalia', items: [] }
    ]
  },
  {
    id: 'eggs',
    name: 'Eggs',
    icon: '🐣',
    subcategories: [
      { name: 'Classic Eggs', items: [] },
      { name: 'Desi Eggs', items: [] },
      { name: 'Kadaknath Eggs', items: [] },
      { name: 'Duck Eggs', items: [] },
      { name: 'Bater Eggs', items: [] },
      { name: 'Turkey Eggs', items: [] }
    ]
  }
]

export default function Navbar() {
  const cartCount = useCart((s) => s.items.reduce((a, b) => a + b.quantity, 0))
  const [authed, setAuthed] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
  
  useEffect(() => {
    const sb = supabaseClient()
    
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
    
    // Always try to fetch current location
    getUserLocation()
      .then((city) => {
        setLocation(city)
        localStorage.setItem('userLocation', city)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to get location:', error)
        // Fall back to cached location or default
        if (cachedLocation) {
          setLocation(cachedLocation)
        } else {
          setLocation('Bangalore')
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
            <Link href="/" className="font-bold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              MeatCountry
            </Link>
            
            {/* Location Display */}
            <button 
              onClick={() => setShowLocationModal(true)}
              className="hidden md:flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 rounded-full px-4 py-1.5 text-sm transition-colors"
            >
              <MapPin className="h-4 w-4 text-brand-600" />
              <span className="text-neutral-600 font-medium">
                {loading && !location ? 'Loading...' : (location || 'Bangalore')}
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button 
                onClick={() => setShowCategories(true)}
                className="inline-flex items-center gap-2 hover:text-brand-600 transition-colors"
              >
                <Layers className="h-4 w-4" />
                Categories
              </button>
              <Link href="/cart" className="hover:text-brand-600 transition-colors">Cart</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative inline-flex items-center gap-2 hover:text-brand-600 transition-colors">
              <ShoppingCart className="h-5 w-5" />
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
              <div className="flex items-center gap-2">
                <Link href={"/profile" as any} className="inline-flex items-center gap-2 text-sm font-medium hover:text-brand-600 transition-colors">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Profile</span>
                </Link>
                <button
                  onClick={async () => { await supabaseClient().auth.signOut(); setAuthed(false) }}
                  className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 px-3 py-2 text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <Link href="/sign-in" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium transition-colors">
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline">Sign in</span>
              </Link>
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
                            className="inline-flex items-center gap-2 text-lg font-bold text-neutral-800 hover:text-brand-600 transition-colors group"
                          >
                            <span>{sub.name}</span>
                            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </Link>
                          
                          {sub.items && sub.items.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                              {sub.items.map((item, itemIndex) => (
                                <Link
                                  key={itemIndex}
                                  href={`/products?category=${activeCategory}&sub=${sub.name.toLowerCase().replace(/\s+/g, '-')}&item=${item.toLowerCase().replace(/\s+/g, '-')}`}
                                  onClick={() => setShowCategories(false)}
                                  className="group relative px-4 py-3 rounded-xl bg-white hover:bg-gradient-to-r hover:from-brand-50 hover:to-accent-50 text-neutral-600 hover:text-brand-700 transition-all text-sm font-semibold border-2 border-neutral-100 hover:border-brand-300 hover:shadow-md hover:scale-105"
                                >
                                  <span className="relative z-10">{item}</span>
                                  <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-accent-400 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity"></div>
                                </Link>
                              ))}
                            </div>
                          )}
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
    </>
  )
}
