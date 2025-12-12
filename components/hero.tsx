"use client"
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { MapPin, Search } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-50 -z-10" />
      <div className="text-center space-y-6">
        <motion.div initial="initial" animate="animate" variants={fadeInUp}>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            Fresh Cuts. Honest Pricing.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-neutral-700 max-w-2xl mx-auto">
            Premium chicken, mutton, seafood & more delivered fresh at market prices across India
          </p>
        </motion.div>
        
        <motion.div 
          className="flex items-center justify-center gap-3 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-soft border">
            <MapPin className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-medium">Delivering to</span>
            <span className="text-sm font-semibold text-brand-600">Bangalore</span>
          </div>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search for chicken, mutton, fish..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-neutral-200 focus:border-brand-500 focus:outline-none text-sm shadow-soft"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
