"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Home, Building2, Phone, AlertCircle } from 'lucide-react'

export default function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [landmark, setLandmark] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState<{ level: number; text: string; color: string }>({ level: 0, text: '', color: '' })
  const router = useRouter()

  const calculatePasswordStrength = (pwd: string): { level: number; text: string; color: string } => {
    if (!pwd) return { level: 0, text: '', color: '' }
    
    let strength = 0
    
    // Length check
    if (pwd.length >= 8) strength += 1
    if (pwd.length >= 12) strength += 1
    
    // Character variety checks
    if (/[a-z]/.test(pwd)) strength += 1
    if (/[A-Z]/.test(pwd)) strength += 1
    if (/[0-9]/.test(pwd)) strength += 1
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 1
    
    // Determine strength level
    if (strength <= 2) return { level: 1, text: 'Weak', color: 'bg-red-500' }
    if (strength <= 4) return { level: 2, text: 'Medium', color: 'bg-yellow-500' }
    return { level: 3, text: 'Strong', color: 'bg-green-500' }
  }

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required'
        if (value.trim().length < 3) return 'Name must be at least 3 characters'
        return null
      case 'phone':
        if (!value) return 'Phone number is required'
        if (!/^[0-9]{10}$/.test(value)) return 'Phone must be exactly 10 digits'
        return null
      case 'email':
        if (!value) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format'
        return null
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 6) return 'Password must be at least 6 characters'
        return null
      case 'addressLine1':
        if (!value.trim()) return 'House/Flat number is required'
        return null
      case 'city':
        if (!value.trim()) return 'City is required'
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'City should contain only letters'
        return null
      case 'state':
        if (!value.trim()) return 'State is required'
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'State should contain only letters'
        return null
      case 'pincode':
        if (!value) return 'Pincode is required'
        if (!/^[0-9]{6}$/.test(value)) return 'Pincode must be exactly 6 digits'
        return null
      default:
        return null
    }
  }

  const handleBlur = (name: string, value: string) => {
    const errorMsg = validateField(name, value)
    setValidationErrors(prev => ({
      ...prev,
      [name]: errorMsg || ''
    }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Validate all fields before submission
    if (mode === 'sign-up') {
      const errors: Record<string, string> = {}
      const fields = {
        fullName, phone, email, password, addressLine1, city, state, pincode
      }
      
      Object.entries(fields).forEach(([key, value]) => {
        const errorMsg = validateField(key, value)
        if (errorMsg) errors[key] = errorMsg
      })
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        setError('Please fix all validation errors before submitting')
        setLoading(false)
        return
      }
    }
    
    const sb = supabaseClient()
    try {
      if (mode === 'sign-in') {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        // Sign up the user
        const { data, error } = await sb.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) throw error
        
        // Create home address if user was created successfully
        if (data.user) {
          try {
            // Use API route to save address (works even without active session)
            const addressResponse = await fetch('/api/create-address', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: data.user.id,
                addressData: {
                  full_name: fullName,
                  phone: phone,
                  address_line_1: addressLine1,
                  address_line_2: addressLine2 || null,
                  city: city,
                  state: state,
                  pincode: pincode,
                  landmark: landmark || null,
                  address_type: 'home',
                  is_default: true
                }
              })
            })

            const addressResult = await addressResponse.json()
            
            if (!addressResponse.ok) {
              console.error('Address save error:', addressResult)
            } else {
              console.log('Address saved successfully:', addressResult.data)
            }
          } catch (addressException: any) {
            console.error('Address save exception:', addressException)
          }

          // Check if email confirmation is required
          if (!data.session) {
            router.push('/confirm-email')
            return
          }
        }
      }
      router.replace('/')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form onSubmit={onSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-2xl space-y-4 p-6 rounded-lg border bg-white">
      <h1 className="text-2xl font-bold">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
      
      {mode === 'sign-up' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Full Name *</label>
              <input 
                value={fullName} 
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (validationErrors.fullName) handleBlur('fullName', e.target.value)
                }}
                onBlur={(e) => handleBlur('fullName', e.target.value)}
                type="text" 
                required 
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${validationErrors.fullName ? 'border-red-500 focus:ring-red-400' : 'focus:ring-brand-400'}`}
              />
              {validationErrors.fullName && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {validationErrors.fullName}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number *
              </label>
              <input 
                value={phone} 
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setPhone(value)
                  if (validationErrors.phone) handleBlur('phone', value)
                }}
                onBlur={(e) => handleBlur('phone', e.target.value)}
                type="tel" 
                required 
                pattern="[0-9]{10}" 
                minLength={10}
                maxLength={10}
                placeholder="10 digit mobile number" 
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${validationErrors.phone ? 'border-red-500 focus:ring-red-400' : 'focus:ring-brand-400'}`}
              />
              {validationErrors.phone && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {validationErrors.phone}
                </p>
              )}
            </div>
          </div>
        </>
      )}
      
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">Email *</label>
        <input 
          value={email} 
          onChange={(e) => {
            setEmail(e.target.value)
            if (validationErrors.email) handleBlur('email', e.target.value)
          }}
          onBlur={(e) => handleBlur('email', e.target.value)}
          type="email" 
          required 
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${validationErrors.email ? 'border-red-500 focus:ring-red-400' : 'focus:ring-brand-400'}`}
        />
        {validationErrors.email && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {validationErrors.email}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">Password *</label>
        <input 
          value={password} 
          onChange={(e) => {
            setPassword(e.target.value)
            if (mode === 'sign-up') {
              setPasswordStrength(calculatePasswordStrength(e.target.value))
            }
            if (validationErrors.password) handleBlur('password', e.target.value)
          }}
          onBlur={(e) => handleBlur('password', e.target.value)}
          type="password" 
          required 
          minLength={6} 
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${validationErrors.password ? 'border-red-500 focus:ring-red-400' : 'focus:ring-brand-400'}`}
        />
        {mode === 'sign-up' && password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.level >= 1 ? passwordStrength.color : 'bg-gray-200'}`}></div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.level >= 2 ? passwordStrength.color : 'bg-gray-200'}`}></div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.level >= 3 ? passwordStrength.color : 'bg-gray-200'}`}></div>
            </div>
            <p className={`text-xs font-medium ${passwordStrength.level === 1 ? 'text-red-600' : passwordStrength.level === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
              {passwordStrength.text} password
            </p>
          </div>
        )}
        {validationErrors.password && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {validationErrors.password}
          </p>
        )}
      </div>
      
      {mode === 'sign-up' && (
        <>
          <div className="pt-4 border-t">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Home className="h-5 w-5 text-brand-600" />
              Home Delivery Address
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">House/Flat/Block No. *</label>
                <input 
                  value={addressLine1} 
                  onChange={(e) => {
                    setAddressLine1(e.target.value)
                    if (validationErrors.addressLine1) handleBlur('addressLine1', e.target.value)
                  }}
                  onBlur={(e) => handleBlur('addressLine1', e.target.value)}
                  type="text" 
                  required 
                  placeholder="e.g., 123, Sunshine Apartments" 
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${validationErrors.addressLine1 ? 'border-red-500 focus:ring-red-400' : 'focus:ring-brand-400'}`}
                />
                {validationErrors.addressLine1 && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.addressLine1}
                  </p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Apartment/Road/Area</label>
                <input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} type="text" placeholder="e.g., MG Road, Sector 5" className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Landmark (Optional)
                </label>
                <input value={landmark} onChange={(e) => setLandmark(e.target.value)} type="text" placeholder="e.g., Near City Mall" className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> City *
                  </label>
                  <input 
                    value={city} 
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setCity(value)
                      if (validationErrors.city) handleBlur('city', value)
                    }}
                    onBlur={(e) => handleBlur('city', e.target.value)}
                    type="text" 
                    required 
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${validationErrors.city ? 'border-red-500 focus:ring-red-400' : 'focus:ring-brand-400'}`}
                  />
                  {validationErrors.city && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {validationErrors.city}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">State *</label>
                  <input 
                    value={state} 
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setState(value)
                      if (validationErrors.state) handleBlur('state', value)
                    }}
                    onBlur={(e) => handleBlur('state', e.target.value)}
                    type="text" 
                    required 
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${validationErrors.state ? 'border-red-500 focus:ring-red-400' : 'focus:ring-brand-400'}`}
                  />
                  {validationErrors.state && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {validationErrors.state}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Pincode *</label>
                  <input 
                    value={pincode} 
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setPincode(value)
                      if (validationErrors.pincode) handleBlur('pincode', value)
                    }}
                    onBlur={(e) => handleBlur('pincode', e.target.value)}
                    type="text" 
                    required 
                    pattern="[0-9]{6}"
                    minLength={6}
                    maxLength={6}
                    placeholder="6 digits" 
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${validationErrors.pincode ? 'border-red-500 focus:ring-red-400' : 'focus:ring-brand-400'}`}
                  />
                  {validationErrors.pincode && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {validationErrors.pincode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="w-full rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-60">
        {loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create Account & Save Address'}
      </button>
      <p className="text-xs text-neutral-600 text-center">
        {mode === 'sign-in' ? (
          <>New here? <Link href="/sign-up" className="text-brand-600 hover:underline">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href="/sign-in" className="text-brand-600 hover:underline">Sign in</Link></>
        )}
      </p>
    </motion.form>
  )
}
