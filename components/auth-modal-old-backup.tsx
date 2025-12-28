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
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'otp' | 'email-otp'>(initialMode)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('email')
  const router = useRouter()

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode, isOpen])

  const handleEmailOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      // Send FREE email OTP via Supabase (no configuration needed!)
      const { error: otpError } = await supabaseClient().auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName || email.split('@')[0]
          }
        }
      })

      if (otpError) {
        throw otpError
      }

      setSuccess('OTP sent to your email! Check your inbox.')
      setOtpSent(true)
      setMode('email-otp')
      setLoading(false)
    } catch (err: any) {
      if (err.message.includes('rate limit')) {
        setError('Too many requests. Please try again after a few minutes.')
      } else {
        setError(err.message || 'Failed to send OTP')
      }
      setLoading(false)
    }
  }

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
      // Send OTP via free SMS API
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setSuccess('OTP sent to your mobile number')
      setOtpSent(true)
      setMode('otp')
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Try email OTP instead.')
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
      // Verify email OTP with Supabase (FREE!)
      const { data, error: verifyError } = await supabaseClient().auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      })

      if (verifyError) {
        throw verifyError
      }

      // Update user profile
      if (data.user) {
        await supabaseClient()
          .from('profiles')
          .upsert({
            id: data.user.id,
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
      } else if (err.message.includes('invalid')) {
        setError('Invalid OTP. Please check and try again.')
      } else {
        setError(err.message || 'Failed to verify OTP')
      }
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
      // Verify phone OTP via API
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP')
      }

      // Sign in the user with phone
      const { data: authData, error: authError } = await supabaseClient().auth.signInWithPassword({
        email: `${phone}@temp.meatcountry.com`,
        password: data.sessionToken
      })

      if (authError) {
        // Create account if doesn't exist
        const { error: signUpError } = await supabaseClient().auth.signUp({
          email: `${phone}@temp.meatcountry.com`,
          password: data.sessionToken,
          options: {
            data: { phone, full_name: fullName || 'User' }
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

              {/* Email OTP View */}
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
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={handleEmailOtpSubmit}
                    disabled={loading}
                    className="w-full text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Resend OTP
                  </button>
                </form>
              )}

              {/* Phone OTP View */}
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
              {mode !== 'otp' && mode !== 'email-otp' && (
                <>
                  {/* Email OTP Login (FREE - Recommended) */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-green-800 mb-1">✨ Recommended - Completely FREE!</p>
                    <p className="text-xs text-green-700">Get instant OTP via email, no charges</p>
                  </div>

                  <form onSubmit={handleEmailOtpSubmit} className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !email}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? 'Sending...' : '🆓 Get FREE Email OTP'}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or use phone</span>
                    </div>
                  </div>

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
