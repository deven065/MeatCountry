"use client"
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { MapPin, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getUserLocation } from '@/lib/location'

export default function Hero() {
  const [location, setLocation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/chicken.avif')`,
            filter: 'brightness(0.3) blur(2px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/95 via-neutral-800/90 to-brand-900/85" />
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container-responsive text-center space-y-8">
        <motion.div 
          initial="initial" 
          animate="animate" 
          variants={fadeInUp}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-brand-400 via-accent-400 to-brand-500 bg-clip-text text-transparent drop-shadow-2xl">
              Fresh Cuts.
            </span>
            <br />
            <span className="bg-gradient-to-r from-accent-500 via-brand-500 to-accent-600 bg-clip-text text-transparent drop-shadow-2xl">
              Honest Pricing.
            </span>
          </h1>
          
          <motion.p 
            className="mt-6 text-lg md:text-2xl text-neutral-200 max-w-3xl mx-auto font-medium leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Premium chicken, mutton, seafood & more delivered fresh at market prices across India
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="flex items-center justify-center gap-3 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-full px-6 py-3 shadow-2xl border-2 border-white/50 hover:scale-105 transition-transform">
            <MapPin className="h-5 w-5 text-brand-600" />
            <span className="text-base font-semibold text-neutral-700">Delivering to</span>
            <span className="text-base font-black text-brand-600">
              {loading && !location ? 'Loading...' : (location || 'Bangalore')}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-neutral-400 group-hover:text-brand-500 transition-colors" />
              <input
                type="text"
                placeholder="Search for chicken, mutton, fish..."
                className="w-full pl-16 pr-6 py-5 rounded-2xl border-2 border-white/50 bg-white/95 backdrop-blur-md focus:border-brand-500 focus:bg-white focus:outline-none text-base font-medium shadow-2xl placeholder:text-neutral-400 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 text-neutral-300">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold">Fresh Daily</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold">Hygienically Packed</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold">Same Day Delivery</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
