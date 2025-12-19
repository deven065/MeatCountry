"use client"
import { motion } from 'framer-motion'
import { MapPin, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getUserLocation } from '@/lib/location'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const [location, setLocation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  useEffect(() => {
    // Check if we have a cached location first
    const cachedLocation = localStorage.getItem('userLocation')
    if (cachedLocation) {
      setLocation(cachedLocation)
      setLoading(false)
    }

    // Then fetch the current location (will update if different)
    getUserLocation()
      .then((city) => {
        console.log('Detected location:', city)
        setLocation(city)
        localStorage.setItem('userLocation', city)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to get location:', error)
        if (!cachedLocation) {
          setLocation('Bangalore')
        }
        setLoading(false)
      })
  }, [])

  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image - Dimensions: 1920px x 600px (Desktop) or 1200px x 600px (Tablet/Mobile) */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-orange-50 to-red-50">
        <div className="absolute inset-0 bg-center bg-cover bg-no-repeat" style={{
          backgroundImage: `url('/bg-banner-1.jpg')`,
          imageRendering: 'crisp-edges',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }} />
      </div>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40" />

      <div className="container-responsive relative z-10">
        <div className="text-center max-w-5xl mx-auto space-y-8">
          
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-4 leading-none" style={{ textShadow: '2px 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(239,68,68,0.5)' }}>
              Fresh Cuts. <br />
              <span className="text-accent-400" style={{ textShadow: '2px 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(251,146,60,0.5)' }}>Honest Pricing.</span>
            </h1>
            <p className="text-lg md:text-xl text-white font-medium max-w-2xl mx-auto" style={{ textShadow: '1px 1px 10px rgba(0,0,0,0.8)' }}>
              Premium chicken, mutton, seafood & more delivered fresh at market prices across India
            </p>
          </motion.div>

          {/* Location Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border-2 border-neutral-200">
              <MapPin className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-semibold text-neutral-600">Delivering to</span>
              <span className="text-sm font-bold text-brand-600">
                {loading && !location ? 'Loading...' : (location || 'Bangalore')}
              </span>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for chicken, mutton, fish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-neutral-300 focus:border-brand-500 focus:outline-none text-base bg-white shadow-lg transition-all"
              />
            </form>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-4"
          >
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
              <span className="text-sm font-bold text-neutral-800">Fresh Daily</span>
            </div>
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
              <span className="text-sm font-bold text-neutral-800">Hygienically Packed</span>
            </div>
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
              <span className="text-sm font-bold text-neutral-800">Same Day Delivery</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
