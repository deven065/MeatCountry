"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const banners = [
  {
    id: 1,
    title: "Flat 20% off",
    subtitle: "on your first 5 orders",
    ctaText: "ORDER NOW",
    link: "/offers",
    bgGradient: "bg-gradient-to-br from-rose-500 via-pink-400 to-fuchsia-400",
    textColor: "text-white",
    subtitleColor: "text-pink-50",
    buttonColor: "bg-white hover:bg-pink-50 text-pink-600",
    badgeText: "LIMITED TIME OFFER",
    imageUrl: "/chicken.avif",
    terms: "*T&C Apply",
    showProducts: true
  },
  {
    id: 2,
    title: "Host like a pro",
    subtitle: "with Flat ₹100 off",
    badge: "PARTY STARTERS",
    code: "HOUSEPARTY",
    ctaText: "SHOP NOW",
    link: "/products?category=ready-to-cook",
    bgGradient: "bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700",
    textColor: "text-yellow-300",
    subtitleColor: "text-white",
    buttonColor: "bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-emerald-900",
    badgeBg: "bg-gradient-to-r from-blue-800 to-blue-900",
    imageUrl: "/chicken.avif",
    terms: "*On party packs",
    showProducts: true,
    festive: true
  }
]

export default function PromoBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection
      if (nextIndex < 0) nextIndex = banners.length - 1
      if (nextIndex >= banners.length) nextIndex = 0
      return nextIndex
    })
  }

  // Auto-play carousel removed - user will manually navigate

  const currentBanner = banners[currentIndex]

  return (
    <section className="container-responsive py-3">
      <div className="relative overflow-hidden rounded-2xl shadow-xl min-h-[200px] md:min-h-[240px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 200, damping: 30 },
              opacity: { duration: 0.4, ease: "easeInOut" }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            }}
            className="absolute inset-0"
          >
            <Link href={currentBanner.link as any}>
              <div className={`relative overflow-hidden rounded-2xl ${currentBanner.bgGradient} cursor-pointer group h-full`}>
                
                {/* Decorative elements for festive banner */}
                {currentBanner.festive && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Christmas ornaments */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-10 h-10 rounded-full border-4 border-yellow-400"
                        style={{
                          top: `${10 + Math.random() * 15}%`,
                          left: `${5 + i * 12}%`,
                          background: 'radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b)',
                        }}
                        animate={{
                          y: [0, -8, 0],
                          rotate: [0, 5, 0, -5, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                    {/* Sparkles */}
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={`star-${i}`}
                        className="absolute"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                        }}
                      >
                        <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]" />
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 p-4 md:p-6 h-full items-center">
                  {/* Left side - Product images */}
                  <div className="md:col-span-2 relative flex items-center justify-center">
                    {currentBanner.showProducts && (
                      <div className="relative w-full h-32 md:h-48 flex items-center justify-center gap-2">
                        {/* Food plate 1 */}
                        <motion.div
                          className="relative w-24 h-24 md:w-36 md:h-36"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3, type: "spring" }}
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 shadow-2xl">
                            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-50 to-white shadow-inner" />
                            <div className="absolute inset-4 rounded-full flex items-center justify-center">
                              <Image
                                src={currentBanner.imageUrl}
                                alt="Food item"
                                fill
                                className="object-contain drop-shadow-2xl scale-75"
                              />
                            </div>
                          </div>
                        </motion.div>

                        {/* Food plate 2 */}
                        <motion.div
                          className="relative w-28 h-28 md:w-40 md:h-40 -ml-6"
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.4, type: "spring" }}
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 shadow-2xl">
                            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-50 to-white shadow-inner" />
                            <div className="absolute inset-4 rounded-full flex items-center justify-center">
                              <Image
                                src={currentBanner.imageUrl}
                                alt="Food item"
                                fill
                                className="object-contain drop-shadow-2xl scale-75"
                              />
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>

                  {/* Right side - Text content */}
                  <div className="md:col-span-3 flex flex-col justify-center space-y-2 md:space-y-3 text-right md:pr-4">
                    {/* Badge */}
                    {currentBanner.badge && (
                      <motion.div
                        className={`inline-flex items-center justify-center self-end ${currentBanner.badgeBg} border-2 border-red-500 px-4 py-1.5 rounded-lg shadow-xl`}
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <p className="text-xs md:text-sm font-black text-yellow-300 tracking-wide" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                          {currentBanner.badge}
                        </p>
                      </motion.div>
                    )}

                    {currentBanner.id === 1 && (
                      <motion.div
                        className="inline-flex items-center justify-center self-end bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-4 py-1 rounded-full shadow-lg border-2 border-yellow-500"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <p className="text-[10px] md:text-xs font-black text-pink-900 tracking-wider">
                          {currentBanner.badgeText}
                        </p>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-0.5"
                    >
                      <h2 
                        className={`text-3xl md:text-5xl font-black ${currentBanner.textColor} italic leading-tight`}
                        style={{ 
                          textShadow: currentBanner.id === 2 
                            ? '3px 3px 0px rgba(0,0,0,0.2), 6px 6px 20px rgba(0,0,0,0.3)' 
                            : '2px 2px 8px rgba(0,0,0,0.2)',
                          letterSpacing: '-0.02em'
                        }}
                      >
                        {currentBanner.title}
                      </h2>
                      <p 
                        className={`text-base md:text-xl font-bold ${currentBanner.subtitleColor}`}
                        style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.2)' }}
                      >
                        {currentBanner.subtitle}
                      </p>
                    </motion.div>

                    {currentBanner.code && (
                      <motion.div
                        className="inline-flex items-center justify-center self-end"
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-yellow-400 rounded-lg transform -skew-x-6"></div>
                          <div className="relative bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 px-4 py-2 rounded-lg shadow-xl border-2 border-yellow-500">
                            <p className="text-xs md:text-sm font-black text-emerald-900 tracking-wider">
                              Code: <span className="text-sm md:text-base">{currentBanner.code}</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <motion.button
                      className={`inline-flex items-center gap-2 self-end ${currentBanner.buttonColor} font-black px-5 md:px-8 py-2.5 md:py-3 rounded-full shadow-xl transition-all duration-300 group-hover:gap-3 text-sm md:text-base transform group-hover:scale-105`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      style={{ letterSpacing: '0.05em' }}
                    >
                      {currentBanner.ctaText}
                      <ChevronRight className="h-5 w-5 font-bold" />
                    </motion.button>

                    {currentBanner.terms && (
                      <p className={`text-xs md:text-sm ${currentBanner.subtitleColor} italic opacity-90`}>
                        {currentBanner.terms}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={(e) => {
            e.preventDefault()
            paginate(-1)
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-neutral-900 rounded-full p-2 md:p-3 shadow-xl transition-all duration-300 hover:scale-110 border-2 border-white/50"
          aria-label="Previous banner"
        >
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 font-bold" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault()
            paginate(1)
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-neutral-900 rounded-full p-2 md:p-3 shadow-xl transition-all duration-300 hover:scale-110 border-2 border-white/50"
          aria-label="Next banner"
        >
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 font-bold" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault()
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-10 bg-white shadow-lg' 
                  : 'w-2.5 bg-white/60 hover:bg-white/90'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
