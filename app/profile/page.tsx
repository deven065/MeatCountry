"use client"
import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, MapPin, Phone, Mail, Home, Building2, Plus, Edit, Trash2, Check, AlertCircle, Briefcase } from 'lucide-react'
import Container from '@/components/container'
import { motion, AnimatePresence } from 'framer-motion'

interface Address {
  id: string
  full_name: string
  phone: string
  address_line_1: string
  address_line_2: string | null
  city: string
  state: string
  pincode: string
  landmark: string | null
  address_type: 'home' | 'work' | 'other'
  is_default: boolean
}

interface UserProfile {
  email: string
  full_name: string
  phone: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    address_type: 'home' as 'home' | 'work' | 'other',
    is_default: false
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const sb = supabaseClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const openAddModal = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      address_type: 'home',
      is_default: addresses.length === 0 // Auto-set as default if it's the first address
    })
    setFormErrors({})
    setShowAddressModal(true)
  }

  const validateAddressForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.full_name.trim()) errors.full_name = 'Name is required'
    if (!/^[0-9]{10}$/.test(formData.phone)) errors.phone = 'Phone must be 10 digits'
    if (!formData.address_line_1.trim()) errors.address_line_1 = 'Address is required'
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.state.trim()) errors.state = 'State is required'
    if (!/^[0-9]{6}$/.test(formData.pincode)) errors.pincode = 'Pincode must be 6 digits'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddAddress = async () => {
    if (!validateAddressForm()) return
    
    setSubmitting(true)
    try {
      const { data: { user: authUser } } = await sb.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')

      // If setting as default, unset all other defaults first
      if (formData.is_default) {
        await sb.from('addresses').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000')
      }

      const { error } = await sb.from('addresses').insert({
        user_id: authUser.id,
        ...formData,
        address_line_2: formData.address_line_2 || null,
        landmark: formData.landmark || null
      })

      if (error) throw error

      setShowAddressModal(false)
      loadUserData()
    } catch (error: any) {
      console.error('Error adding address:', error)
      setFormErrors({ submit: error.message || 'Failed to add address' })
    } finally {
      setSubmitting(false)
    }
  }

  const loadUserData = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await sb.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        router.push('/sign-in')
        return
      }
      
      if (!authUser) {
        router.push('/sign-in')
        return
      }

      setUser({
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || '',
        phone: authUser.user_metadata?.phone || ''
      })

      // Load addresses with detailed error logging
      console.log('Fetching addresses for user:', authUser.id)
      const { data: addressData, error } = await sb
        .from('addresses')
        .select('*')
        .eq('user_id', authUser.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading addresses:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      } else {
        console.log('Loaded addresses:', addressData)
        setAddresses(addressData || [])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      // Unset all defaults first
      await sb.from('addresses').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000')
      
      // Set new default
      const { error } = await sb.from('addresses').update({ is_default: true }).eq('id', addressId)
      
      if (error) throw error
      loadUserData()
    } catch (error) {
      console.error('Error setting default address:', error)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    try {
      const { error } = await sb.from('addresses').delete().eq('id', addressId)
      if (error) throw error
      loadUserData()
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }

  const handleSignOut = async () => {
    await sb.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      </Container>
    )
  }

  if (!user) return null

  return (
    <Container>
      <div className="py-12">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border p-8 mb-8"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-brand-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">{user.full_name}</h1>
                  <div className="mt-3 space-y-2">
                    <p className="flex items-center gap-2 text-neutral-600">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                    <p className="flex items-center gap-2 text-neutral-600">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* Addresses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">Delivery Addresses</h2>
              <button
                onClick={() => setShowAddressModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="bg-white rounded-lg border-2 border-dashed border-neutral-300 p-12 text-center">
                <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No addresses saved</h3>
                <p className="text-neutral-600 mb-4">Add your first delivery address to get started</p>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {addresses.map((address, index) => (
                    <motion.div
                      key={address.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white rounded-lg shadow-sm border-2 p-6 relative ${
                        address.is_default ? 'border-brand-500' : 'border-neutral-200'
                      }`}
                    >
                      {address.is_default && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full">
                          <Check className="w-3 h-3" />
                          Default
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-4">
                        {address.address_type === 'home' ? (
                          <Home className="w-5 h-5 text-brand-600 mt-1" />
                        ) : address.address_type === 'work' ? (
                          <Building2 className="w-5 h-5 text-brand-600 mt-1" />
                        ) : (
                          <MapPin className="w-5 h-5 text-brand-600 mt-1" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900 capitalize mb-1">
                            {address.address_type}
                          </h3>
                          <p className="text-sm text-neutral-600">{address.full_name}</p>
                          <p className="text-sm text-neutral-600">{address.phone}</p>
                        </div>
                      </div>

                      <div className="text-sm text-neutral-700 space-y-1 mb-4">
                        <p>{address.address_line_1}</p>
                        {address.address_line_2 && <p>{address.address_line_2}</p>}
                        {address.landmark && <p className="text-neutral-500">Near {address.landmark}</p>}
                        <p className="font-medium">{address.city}, {address.state} - {address.pincode}</p>
                      </div>

                      <div className="flex gap-2">
                        {!address.is_default && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="flex-1 px-3 py-2 text-sm font-medium text-brand-600 border border-brand-600 rounded-md hover:bg-brand-50 transition-colors"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="px-3 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddressModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">Add New Delivery Address</h2>
            
            <div className="space-y-4">
              {/* Name and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Full Name *</label>
                  <input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.full_name ? 'border-red-500' : 'border-neutral-300'}`}
                  />
                  {formErrors.full_name && <p className="text-xs text-red-600">{formErrors.full_name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Phone *</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10 digits"
                    className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.phone ? 'border-red-500' : 'border-neutral-300'}`}
                  />
                  {formErrors.phone && <p className="text-xs text-red-600">{formErrors.phone}</p>}
                </div>
              </div>

              {/* Address Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Address Type *</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, address_type: 'home' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-colors ${
                      formData.address_type === 'home' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span className="font-medium">Home</span>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, address_type: 'work' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-colors ${
                      formData.address_type === 'work' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">Work</span>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, address_type: 'other' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-colors ${
                      formData.address_type === 'other' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Other</span>
                  </button>
                </div>
              </div>

              {/* Address Line 1 */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">House/Flat/Block No. *</label>
                <input
                  value={formData.address_line_1}
                  onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                  placeholder="e.g., 123, Sunshine Apartments"
                  className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.address_line_1 ? 'border-red-500' : 'border-neutral-300'}`}
                />
                {formErrors.address_line_1 && <p className="text-xs text-red-600">{formErrors.address_line_1}</p>}
              </div>

              {/* Address Line 2 */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Apartment/Road/Area</label>
                <input
                  value={formData.address_line_2}
                  onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                  placeholder="e.g., MG Road, Sector 5"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Landmark (Optional)</label>
                <input
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g., Near City Mall"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">City *</label>
                  <input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                    className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.city ? 'border-red-500' : 'border-neutral-300'}`}
                  />
                  {formErrors.city && <p className="text-xs text-red-600">{formErrors.city}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">State *</label>
                  <input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                    className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.state ? 'border-red-500' : 'border-neutral-300'}`}
                  />
                  {formErrors.state && <p className="text-xs text-red-600">{formErrors.state}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Pincode *</label>
                  <input
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="6 digits"
                    className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.pincode ? 'border-red-500' : 'border-neutral-300'}`}
                  />
                  {formErrors.pincode && <p className="text-xs text-red-600">{formErrors.pincode}</p>}
                </div>
              </div>

              {/* Default Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="text-sm font-medium">Set as default delivery address</span>
              </label>

              {formErrors.submit && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600">{formErrors.submit}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAddress}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 font-medium disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Container>
  )
}
