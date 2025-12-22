"use client"
import { useEffect, useState } from 'react'
import Script from 'next/script'
import useCompare from './store/compare'

export default function ChatSupport() {
  const { products } = useCompare()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    // Initialize Tawk.to chat widget
    // Replace with your Tawk.to property ID
    const Tawk_API = (window as any).Tawk_API || {}
    const Tawk_LoadStart = new Date()
    
    ;(function() {
      const s1 = document.createElement("script")
      const s0 = document.getElementsByTagName("script")[0]
      s1.async = true
      s1.src = 'https://embed.tawk.to/YOUR_TAWK_TO_PROPERTY_ID/YOUR_TAWK_TO_WIDGET_ID'
      s1.charset = 'UTF-8'
      s1.setAttribute('crossorigin', '*')
      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0)
      }
    })()
  }, [])
  
  // Adjust bottom position when compare bar is visible
  const hasCompareItems = mounted && products.length > 0
  const bottomClass = hasCompareItems ? 'bottom-32' : 'bottom-6'

  return (
    <>
      {/* Tawk.to Live Chat */}
      {/* Replace the src URL with your actual Tawk.to embed code */}
      
      {/* Alternative: Custom Chat Button */}
      <div className={`fixed ${bottomClass} right-6 z-50 transition-all duration-300`}>
        <button
          onClick={() => {
            // Open chat widget
            const tawk = (window as any).Tawk_API
            if (tawk && tawk.toggle) {
              tawk.toggle()
            }
          }}
          className="group flex items-center gap-3 bg-brand-600 hover:bg-brand-700 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-semibold hidden md:inline">Chat with us</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </button>
      </div>
    </>
  )
}
