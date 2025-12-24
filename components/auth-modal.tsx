"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabaseClient } from '@/lib/supabase/client'
import { X, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'sign-in' | 'sign-up'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'sign-in' }: AuthModalProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'otp'>(initialMode)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode, isOpen])

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate phone number
    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number')
      setLoading(false)
      return
    }

    try {
      // For demo: simulate OTP sending
      // In production, integrate with SMS gateway (Twilio, MSG91, etc.)
      setSuccess('OTP sent to your mobile number')
      setOtpSent(true)
      setMode('otp')
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
      setLoading(false)
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!/^[0-9]{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      // For demo: simulate OTP verification
      // In production, verify OTP with backend
      
      // After OTP verification, sign up or sign in the user
      const { data, error: authError } = await supabaseClient().auth.signInWithPassword({
        email: `${phone}@meatcountry.temp`, // Temporary email format
        password: phone // Use phone as password for demo
      })

      if (authError) {
        // If user doesn't exist, create account
        const { data: signUpData, error: signUpError } = await supabaseClient().auth.signUp({
          email: `${phone}@meatcountry.temp`,
          password: phone,
          options: {
            data: {
              phone: phone,
              full_name: fullName || 'User'
            }
          }
        })

        if (signUpError) throw signUpError
      }

      setSuccess('Successfully logged in!')
      setTimeout(() => {
        onClose()
        router.refresh()
      }, 1000)
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
        setSuccess('Successfully logged in!')
        setTimeout(() => {
          onClose()
          router.refresh()
        }, 1000)
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
    onClose()
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
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Content */}
            <div className="p-8">
              {/* Logo/Header */}
              <div className="mb-8">
                <div className="w-32 h-12 relative mb-4">
                  <img src="/logo.png" alt="MeatCountry" className="object-contain" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'otp' ? 'Verify OTP' : mode === 'sign-up' ? 'Sign Up' : 'Sign In/Sign Up'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {mode === 'otp' 
                    ? `Enter the OTP sent to ${phone}` 
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

              {/* OTP View */}
              {mode === 'otp' && (
                <form onSubmit={handleOtpVerify} className="space-y-4">
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
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-2xl tracking-widest"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Proceed Via OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePhoneSubmit}
                    disabled={loading}
                    className="w-full text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Resend OTP
                  </button>
                </form>
              )}

              {/* Phone/Email Sign In View */}
              {mode !== 'otp' && (
                <>
                  {/* Phone Number Login */}
                  <form onSubmit={handlePhoneSubmit} className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || phone.length !== 10}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      {loading ? 'Sending OTP...' : 'Proceed Via OTP'}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                    </div>
                  </div>

                  {/* Email Login */}
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {mode === 'sign-up' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required={mode === 'sign-up'}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      {loading ? 'Processing...' : mode === 'sign-up' ? 'Sign Up' : 'Sign In'}
                    </button>
                  </form>

                  {/* Toggle Mode */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      {mode === 'sign-up' ? 'Already have an account?' : "Don't have an account?"}{' '}
                      <button
                        onClick={() => {
                          setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')
                          resetForm()
                        }}
                        className="text-red-600 hover:text-red-700 font-semibold"
                      >
                        {mode === 'sign-up' ? 'Sign In' : 'Sign Up'}
                      </button>
                    </p>
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-gray-500 text-center mt-6">
                    By signing in you agree to our{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
                      terms and conditions
                    </a>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
