"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabaseClient } from '@/lib/supabase/client'
import { X, AlertCircle, CheckCircle, ArrowLeft, Mail, Smartphone, User, Package, MapPin, Settings, HelpCircle, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'sign-in' | 'sign-up'
}

interface UserProfile {
  email: string
  full_name?: string
  phone?: string
  role?: string
}

export default function AuthModal({ isOpen, onClose, initialMode = 'sign-in' }: AuthModalProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'email-otp' | 'phone-otp' | 'profile'>(initialMode)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMode(initialMode)
    checkAuthStatus()
  }, [initialMode, isOpen])

  // Check if user is already authenticated
  const checkAuthStatus = async () => {
    const sb = supabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    
    if (user && isOpen) {
      // User is authenticated, load profile and show profile view
      await loadUserProfile(user.id)
      setMode('profile')
    }
  }

  const loadUserProfile = async (userId: string) => {
    const sb = supabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    
    if (user) {
      const { data: profileData } = await sb
        .from('user_profiles')
        .select('full_name, phone')
        .eq('user_id', userId)
        .single()
      
      setUserProfile({
        email: user.email || '',
        full_name: profileData?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
        phone: profileData?.phone,
        role: profileData?.role || 'Customer'
      })
    }
  }

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

  // FREE Email OTP - Works immediately, no setup needed!
  const handleEmailOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const { error: otpError } = await supabaseClient().auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName || email.split('@')[0]
          }
        }
      })

      if (otpError) throw otpError

      setSuccess('✅ OTP sent to your email! Check your inbox.')
      setOtpSent(true)
      setMode('email-otp')
      setLoading(false)
    } catch (err: any) {
      if (err.message.includes('rate limit')) {
        setError('Too many requests. Please try again in a few minutes.')
      } else {
        setError(err.message || 'Failed to send OTP')
      }
      setLoading(false)
    }
  }

  const handleEmailOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!/^[0-9]{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      const { data, error: verifyError } = await supabaseClient().auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      })

      if (verifyError) throw verifyError

      // Update profile
      if (data.user) {
        await supabaseClient()
          .from('user_profiles')
          .upsert({
            user_id: data.user.id,
            full_name: fullName || email.split('@')[0],
            updated_at: new Date().toISOString()
          })
      }

      setSuccess('Successfully logged in!')
      setTimeout(() => {
        onClose()
        router.refresh()
      }, 1000)
    } catch (err: any) {
      if (err.message.includes('expired')) {
        setError('OTP expired. Please request a new one.')
      } else if (err.message.includes('invalid') || err.message.includes('Token')) {
        setError('Invalid OTP. Please check and try again.')
      } else {
        setError(err.message || 'Failed to verify OTP')
      }
      setLoading(false)
    }
  }

  // Mobile OTP - Send SMS
  const handlePhoneOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setSuccess('✅ OTP sent to your mobile number!')
      setOtpSent(true)
      setMode('phone-otp')
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Try email OTP instead.')
      setLoading(false)
    }
  }

  // Mobile OTP - Verify
  const handlePhoneOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!/^[0-9]{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP')
      }

      // Sign in or create user with phone
      const tempEmail = `${phone}@phone.meatcountry.com`
      
      // Try to sign in first
      const { error: signInError } = await supabaseClient().auth.signInWithPassword({
        email: tempEmail,
        password: data.sessionToken
      })

      if (signInError) {
        // Create new account if doesn't exist
        const { data: signUpData, error: signUpError } = await supabaseClient().auth.signUp({
          email: tempEmail,
          password: data.sessionToken,
          options: {
            data: {
              phone: phone,
              full_name: fullName || 'User'
            }
          }
        })

        if (signUpError) throw signUpError

        // Update profile
        if (signUpData.user) {
          await supabaseClient()
            .from('user_profiles')
            .upsert({
              user_id: signUpData.user.id,
              full_name: fullName || 'User',
              phone: phone,
              updated_at: new Date().toISOString()
            })
        }
      }

      // Load user profile and switch to profile view
      const sb = supabaseClient()
      const { data: { user: currentUser } } = await sb.auth.getUser()
      
      if (currentUser) {
        await loadUserProfile(currentUser.id)
        setSuccess('Successfully logged in!')
        setTimeout(() => {
          setMode('profile')
          setSuccess(null)
          setError(null)
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP')
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'sign-up') {
        const { error: signUpError } = await supabaseClient().auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        })

        if (signUpError) throw signUpError
        setSuccess('Account created! Please check your email to verify.')
      } else {
        const { error: signInError } = await supabaseClient().auth.signInWithPassword({
          email,
          password
        })

        if (signInError) throw signInError
        
        // Load user profile and switch to profile view
        const { data: { user } } = await supabaseClient().auth.getUser()
        if (user) {
          await loadUserProfile(user.id)
          setSuccess('Successfully logged in!')
          setTimeout(() => {
            setMode('profile')
            setSuccess(null)
            setError(null)
          }, 1000)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setPhone('')
    setOtp('')
    setEmail('')
    setPassword('')
    setFullName('')
    setError(null)
    setSuccess(null)
    setOtpSent(false)
  }

  const handleClose = () => {
    resetForm()
    if (mode !== 'profile') {
      setMode(initialMode)
    }
    onClose()
  }

  const handleLogout = async () => {
    await supabaseClient().auth.signOut()
    setUserProfile(null)
    setMode('sign-in')
    resetForm()
    onClose()
    router.refresh()
  }

  const navigateTo = (path: any) => {
    onClose()
    router.push(path)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Content */}
            <div className="p-8">
              {/* Profile View */}
              {mode === 'profile' && userProfile && (
                <div className="space-y-6">
                  {/* User Header */}
                  <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {getInitials(userProfile.full_name, userProfile.email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {userProfile.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {userProfile.email}
                      </p>
                      {userProfile.phone && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {userProfile.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Profile Actions */}
                  <div className="space-y-1">
                    <button
                      onClick={() => navigateTo('/profile')}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                        <User className="h-5 w-5 text-brand-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">My Profile</p>
                        <p className="text-xs text-gray-500">View and edit your details</p>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateTo('/profile?tab=orders')}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">Orders</p>
                        <p className="text-xs text-gray-500">Track your orders</p>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateTo('/profile?tab=addresses')}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">Addresses</p>
                        <p className="text-xs text-gray-500">Manage delivery addresses</p>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateTo('/profile?tab=settings')}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <Settings className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">Account Settings</p>
                        <p className="text-xs text-gray-500">Preferences and security</p>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateTo('/profile?tab=help')}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <HelpCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">Help & Support</p>
                        <p className="text-xs text-gray-500">FAQs and contact us</p>
                      </div>
                    </button>
                  </div>

                  {/* Logout Section */}
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 rounded-lg transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <LogOut className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-red-600">Sign Out</p>
                        <p className="text-xs text-gray-500">Come back soon!</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Auth Views */}
              {mode !== 'profile' && (
                <>
              {/* Logo/Header */}
              <div className="mb-8">
                <div className="w-32 h-12 relative mb-4">
                  <img src="/logo.png" alt="MeatCountry" className="object-contain" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'email-otp' ? 'Verify Email OTP' : 'Sign In'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {mode === 'email-otp' 
                    ? `Enter the OTP sent to ${email}` 
                    : 'For the love of meat!'}
                </p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{success}</p>
                </motion.div>
              )}

              {/* Email OTP Verification View */}
              {mode === 'email-otp' && (
                <form onSubmit={handleEmailOtpVerify} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('sign-in')
                      setOtpSent(false)
                      setOtp('')
                    }}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change email
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP from Email
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-center text-2xl tracking-widest font-bold"
                      disabled={loading}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Check your email inbox for the OTP
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    {loading ? 'Verifying...' : '✓ Verify & Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={handleEmailOtpSubmit}
                    disabled={loading}
                    className="w-full text-sm text-brand-600 hover:text-brand-700 font-medium py-2"
                  >
                    Didn't receive? Resend OTP
                  </button>
                </form>
              )}

              {/* Mobile OTP Verification View */}
              {mode === 'phone-otp' && (
                <form onSubmit={handlePhoneOtpVerify} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('sign-in')
                      setOtpSent(false)
                      setOtp('')
                    }}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change number
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP from SMS
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-center text-2xl tracking-widest font-bold"
                      disabled={loading}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Check your SMS inbox for the OTP
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    {loading ? 'Verifying...' : '✓ Verify & Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePhoneOtpSubmit}
                    disabled={loading}
                    className="w-full text-sm text-brand-600 hover:text-brand-700 font-medium py-2"
                  >
                    Didn't receive? Resend OTP
                  </button>
                </form>
              )}

              {/* Main Sign In View - Email OTP Only */}
              {mode !== 'email-otp' && mode !== 'phone-otp' && (
                <>
                  {/* Email OTP Form */}
                  <form onSubmit={handleEmailOtpSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !email}
                      className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Proceed Via OTP'
                      )}
                    </button>
                  </form>

                  {/* Terms */}
                  <p className="text-xs text-gray-500 text-center mt-6">
                    By signing in you agree to our{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
                      terms and conditions
                    </a>
                  </p>
                </>
              )}
              </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
