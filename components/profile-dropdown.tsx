"use client"
import { useState, useEffect, useRef } from 'react'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ProfileDropdownProps {
  onLogout: () => void
}

interface UserProfile {
  email: string
  full_name?: string
  role?: string
}

export default function ProfileDropdown({ onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const sb = supabaseClient()
      const { data: { user: authUser } } = await sb.auth.getUser()
      
      if (authUser) {
        // Fetch additional user profile info from profiles table if exists
        const { data: profileData } = await sb
          .from('user_profiles')
          .select('full_name')
          .eq('user_id', authUser.id)
          .single()
        
        setUser({
          email: authUser.email || '',
          full_name: profileData?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
          role: profileData?.role || 'Customer'
        })
      }
      
      setLoading(false)
    }

    fetchUserProfile()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Get user initials for avatar fallback
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return parts[0].substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const handleLogout = async () => {
    setIsOpen(false)
    onLogout()
  }

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-neutral-200 animate-pulse" />
    )
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-neutral-50 rounded-full px-2 py-1.5 transition-all duration-200 group"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        {/* User Avatar */}
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white group-hover:ring-brand-100 transition-all">
            {getInitials(user.full_name, user.email)}
          </div>
          {/* Online status indicator */}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
        </div>

        {/* User name (desktop only) */}
        <span className="hidden md:block text-sm font-medium text-neutral-700 max-w-[120px] truncate">
          {user.full_name}
        </span>

        {/* Chevron icon */}
        <ChevronDown 
          className={`hidden md:block h-4 w-4 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden z-50"
          >
            {/* User Info Section */}
            <div className="bg-gradient-to-br from-brand-50 to-white p-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                  {getInitials(user.full_name, user.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-900 truncate text-sm">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-neutral-600 truncate">
                    {user.email}
                  </p>
                  {user.role && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-medium rounded-full">
                      {user.role}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <User className="h-4 w-4 text-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors">
                    View Profile
                  </p>
                  <p className="text-xs text-neutral-500">
                    Manage your account
                  </p>
                </div>
              </Link>

              <Link
                href="/profile?tab=settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-neutral-50 flex items-center justify-center group-hover:bg-neutral-100 transition-colors">
                  <Settings className="h-4 w-4 text-neutral-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                    Account Settings
                  </p>
                  <p className="text-xs text-neutral-500">
                    Preferences & security
                  </p>
                </div>
              </Link>

              <div className="border-t border-neutral-100 my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <LogOut className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-red-600 group-hover:text-red-700 transition-colors">
                    Sign Out
                  </p>
                  <p className="text-xs text-neutral-500">
                    Come back soon!
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
