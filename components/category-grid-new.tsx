"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { Beef, Fish, Drumstick, Egg } from 'lucide-react'

const categories = [
  { name: 'Chicken', icon: Drumstick, color: 'from-orange-500 to-red-500', slug: 'chicken', image: '/chicken.avif?v=2' },
  { name: 'Mutton', icon: Beef, color: 'from-red-600 to-rose-600', slug: 'mutton' },
  { name: 'Seafood', icon: Fish, color: 'from-blue-500 to-cyan-500', slug: 'seafood' },
  { name: 'Eggs', icon: Egg, color: 'from-amber-400 to-yellow-500', slug: 'eggs' }
]

export default function CategoryGrid() {
  return (
    <section className="py-12">
      <motion.h2 
        className="text-2xl md:text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Shop by Category
      </motion.h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {categories.map((cat, i) => {
          const Icon = cat.icon
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/products?category=${cat.slug}`} prefetch={false} scroll={true}>
                <div className="group relative overflow-hidden rounded-2xl aspect-square bg-gradient-to-br hover:scale-105 transition-transform duration-300 cursor-pointer shadow-card hover:shadow-hover">
                  {cat.image ? (
                    <>
                      <img 
                        src={cat.image} 
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                      <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
                        <Icon className="h-12 w-12 md:h-16 md:w-16 mb-3 drop-shadow-lg" strokeWidth={1.5} />
                        <h3 className="text-lg md:text-xl font-bold drop-shadow-md">{cat.name}</h3>
                      </div>
                    </>
                  )}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
