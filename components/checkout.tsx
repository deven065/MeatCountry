"use client"
import { useEffect, useState } from 'react'
import useCart from '@/components/store/cart'
import { useRouter } from 'next/navigation'
import Price from '@/components/price'
import { CreditCard, Wallet, DollarSign, AlertCircle, MapPin, Plus } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface Address {
  id: string
  full_name: string
  phone: string
  address_line_1: string
  address_line_2?: string | null
  city: string
  state: string
  pincode: string
  landmark?: string | null
  address_type: 'home' | 'work' | 'other'
  is_default: boolean
}

interface CheckoutProps {
  userEmail?: string
  userName?: string
  userPhone?: string
  userId?: string
}

export default function Checkout({ userEmail, userName, userPhone, userId }: CheckoutProps) {
  const { items, clear } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay')
  const [customerDetails, setCustomerDetails] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: userPhone || '',
    address: '',
  })
  
  // Address management states
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('saved')
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    full_name: userName || '',
    phone: userPhone || '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    address_type: 'home' as 'home' | 'work' | 'other',
    is_default: false
  })

  const subtotal = items.reduce((a, b) => a + b.price_inr * b.quantity, 0)
  const deliveryFee = subtotal > 500 ? 0 : 40
  const total = subtotal + deliveryFee

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load saved addresses on component mount
  useEffect(() => {
    if (userId) {
      loadUserAddresses()
    } else {
      setAddressMode('new')
    }
  }, [userId])

  const loadUserAddresses = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })

      if (error) {
        console.error('Error loading addresses:', error)
        setAddressMode('new')
        return
      }

      if (data && data.length > 0) {
        setAddresses(data)
        // Auto-select default address or first address
        const defaultAddress = data.find(addr => addr.is_default) || data[0]
        setSelectedAddressId(defaultAddress.id)
        setAddressMode('saved')
      } else {
        setAddressMode('new')
      }
    } catch (err) {
      console.error('Failed to load addresses:', err)
      setAddressMode('new')
    }
  }

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const createOrder = async () => {
    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            customer_name: customerDetails.name,
            customer_email: customerDetails.email,
          },
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      return data.order
    } catch (err: any) {
      console.error('Create order error:', err)
      throw err
    }
  }

  const verifyPayment = async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ) => {
    try {
      const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        }),
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment verification failed')
      }

      return data
    } catch (err: any) {
      console.error('Verify payment error:', err)
      throw err
    }
  }

  const handleRazorpayPayment = async () => {
    const addressData = getSelectedAddressData()
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !addressData) {
      setError('Please fill in all customer details and select a delivery address')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create Razorpay order
      const order = await createOrder()

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Meat Country',
        description: 'Fresh Premium Meats',
        order_id: order.id,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: {
          color: '#DC2626', // brand-600 color
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )

            // Save order to database
            await saveOrderToDatabase(response.razorpay_payment_id, 'paid')

            // Clear cart and redirect
            clear()
            router.push(`/order-success?payment_id=${response.razorpay_payment_id}`)
          } catch (err: any) {
            setError(err.message || 'Payment verification failed')
            setLoading(false)
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            setError('Payment cancelled by user')
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  const handleCODPayment = async () => {
    console.log('=== COD PAYMENT START ===')
    
    setLoading(true)
    setError('')

    try {
      // Get address data
      let addressId: string | null = null
      let addressData: Address | null = null
      
      if (addressMode === 'saved' && selectedAddressId) {
        addressData = addresses.find(a => a.id === selectedAddressId) || null
        addressId = selectedAddressId
      }

      // Basic validation
      if (!userId) {
        throw new Error('Please sign in to place an order')
      }
      if (!items || items.length === 0) {
        throw new Error('Your cart is empty')
      }
      if (addressMode === 'saved' && !addressId) {
        throw new Error('Please select a delivery address')
      }

      // Prepare order data with proper schema
      const orderData = {
        user_id: userId,
        address_id: addressId,
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.images?.[0] || null,
          quantity: item.quantity,
          price: item.price_inr / 100, // Convert from paisa to rupees
          unit: item.unit
        })),
        subtotal: subtotal / 100, // Convert to rupees
        delivery_fee: deliveryFee / 100, // Convert to rupees
        total: total / 100, // Convert to rupees
        payment_method: 'cod',
        payment_status: 'pending'
      }

      console.log('=== SENDING ORDER DATA ===')
      console.log(JSON.stringify(orderData, null, 2))

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData),
      })
        },
        body: JSON.stringify(orderData),
      })

      console.log('=== API RESPONSE ===')
      console.log('Status:', response.status)
      console.log('Status Text:', response.statusText)

      let responseData
      try {
        responseData = await response.json()
        console.log('Response Data:', JSON.stringify(responseData, null, 2))
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError)
        const responseText = await response.text()
        console.log('Raw response:', responseText)
        throw new Error('Server returned invalid response')
      }

      if (!response.ok) {
        const errorMsg = responseData?.details || responseData?.error || responseData?.message || 'Order creation failed'
        console.error('API Error:', errorMsg)
        throw new Error(errorMsg)
      }

      if (!responseData?.success) {
        const errorMsg = responseData?.details || responseData?.error || 'Order creation failed'
        console.error('Order Creation Failed:', errorMsg)
        throw new Error(errorMsg)
      }

      console.log('=== ORDER CREATED SUCCESSFULLY ===')
      console.log('Order ID:', responseData.order?.id)
      
      // Clear cart and redirect
      clear()
      router.push('/order-success?method=cod')
      
    } catch (err: any) {
      console.error('=== ORDER CREATION ERROR ===')
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
      setError(err.message || 'Failed to place order. Please try again.')
      setLoading(false)
    }
  }

  const getSelectedAddressData = () => {
    if (addressMode === 'saved' && selectedAddressId) {
      const address = addresses.find(a => a.id === selectedAddressId)
      if (address) {
        return {
          address_id: address.id,
          full_address: `${address.address_line_1}${address.address_line_2 ? ', ' + address.address_line_2 : ''}, ${address.landmark ? address.landmark + ', ' : ''}${address.city}, ${address.state} - ${address.pincode}`,
          phone: address.phone,
          name: address.full_name
        }
      }
    } else if (addressMode === 'new') {
      if (showNewAddressForm) {
        if (!newAddress.address_line_1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
          return null
        }
        return {
          address_id: null,
          full_address: `${newAddress.address_line_1}${newAddress.address_line_2 ? ', ' + newAddress.address_line_2 : ''}, ${newAddress.landmark ? newAddress.landmark + ', ' : ''}${newAddress.city}, ${newAddress.state} - ${newAddress.pincode}`,
          phone: newAddress.phone,
          name: newAddress.full_name
        }
      } else {
        return customerDetails.address ? {
          address_id: null,
          full_address: customerDetails.address,
          phone: customerDetails.phone,
          name: customerDetails.name
        } : null
      }
    }
    return null
  }

  const saveNewAddress = async () => {
    if (!userId) return null

    try {
      const response = await fetch('/api/create-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          addressData: newAddress
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save address')
      }

      return result.address.id
    } catch (err) {
      console.error('Error saving new address:', err)
      return null
    }
  }

  const saveOrderToDatabase = async (paymentId: string | null, paymentStatus: string) => {
    try {
      const addressData = getSelectedAddressData()
      
      console.log('Debug: saveOrderToDatabase called with:', {
        paymentId,
        paymentStatus,
        customerDetails,
        addressData,
        itemsCount: items.length,
        subtotal,
        total
      })
      
      // For guest users, we can proceed without addressData if customerDetails has address
      if (!addressData && !customerDetails.address) {
        console.error('No address data available')
        throw new Error('No address information provided')
      }

      // Save new address if needed (only for authenticated users)
      let finalAddressId = addressData?.address_id
      if (!finalAddressId && userId && showNewAddressForm) {
        try {
          finalAddressId = await saveNewAddress()
        } catch (err) {
          console.warn('Failed to save new address, proceeding with order anyway:', err)
        }
      }

      // Prepare order items
      const orderItems = items.map(item => ({
        product_id: item.id,
        name: item.name,
        variant_id: item.variant_id,
        unit: item.unit,
        quantity: item.quantity,
        price: item.price_inr,
      }))

      console.log('Debug: Prepared order data:', {
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        customer_address: addressData?.full_address || customerDetails.address || 'Address not provided',
        orderItems,
        subtotal,
        total
      })

      // Create order via API route (server-side with admin privileges)
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerDetails.name,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone,
          customer_address: addressData?.full_address || customerDetails.address || 'Address not provided',
          items: orderItems,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total: total,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          payment_id: paymentId,
          notes: `Address ID: ${finalAddressId || 'new'}, User: ${userId || 'guest'}`
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        console.error('Response status:', response.status)
        throw new Error('Server returned invalid response')
      }
      
      console.log('Order creation response:', { 
        status: response.status, 
        ok: response.ok,
        data 
      })

      if (!response.ok || !data.success) {
        const errorMessage = data.details || data.message || data.error || 'Failed to save order to database'
        console.error('Failed to save order:', {
          status: response.status,
          data,
          errorMessage,
        })
        
        // Show user-friendly error message
        throw new Error(errorMessage)
      }

      return data.order
    } catch (err: any) {
      console.error('Save order error:', err)
      throw err
    }
  }

  const handleCheckout = () => {
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment()
    } else {
      handleCODPayment()
    }
  }

  return (
    <div className="space-y-6">
      {/* Customer Details Form */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Customer Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              value={customerDetails.name}
              onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              value={customerDetails.phone}
              onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email Address *</label>
          <input
            type="email"
            value={customerDetails.email}
            onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="your@email.com"
          />
        </div>
      </div>

      {/* Delivery Address Section */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Delivery Address</h2>
          {addresses.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddressMode('saved')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  addressMode === 'saved'
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Saved Addresses
              </button>
              <button
                type="button"
                onClick={() => setAddressMode('new')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  addressMode === 'new'
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                New Address
              </button>
            </div>
          )}
        </div>

        {/* Saved Addresses */}
        {addressMode === 'saved' && addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((address) => (
              <label key={address.id} className="block">
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedAddressId === address.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1 h-4 w-4 text-brand-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{address.full_name}</span>
                        <span className="text-sm text-gray-500">({address.phone})</span>
                        {address.is_default && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Default
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                          {address.address_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}
                        {address.landmark && `, ${address.landmark}`}
                        <br />
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* New Address */}
        {addressMode === 'new' && (
          <div className="space-y-4">
            {userId ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                      !showNewAddressForm
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium">Quick Address</p>
                      <p className="text-sm text-gray-500">Enter address as text</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                      showNewAddressForm
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium">Save for Future</p>
                      <p className="text-sm text-gray-500">Detailed form to save address</p>
                    </div>
                  </button>
                </div>

                {!showNewAddressForm ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">Delivery Address *</label>
                    <textarea
                      value={customerDetails.address}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                      rows={3}
                      placeholder="Enter your complete delivery address with city, state, and pincode"
                    />
                  </div>
                ) : (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={newAddress.full_name}
                          onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="10-digit mobile number"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                        <input
                          type="text"
                          value={newAddress.address_line_1}
                          onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="House/Flat no, Building, Street"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Address Line 2</label>
                        <input
                          type="text"
                          value={newAddress.address_line_2}
                          onChange={(e) => setNewAddress({ ...newAddress, address_line_2: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Area, Colony (Optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">City *</label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State *</label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Enter state"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Pincode *</label>
                        <input
                          type="text"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="6-digit pincode"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Landmark</label>
                        <input
                          type="text"
                          value={newAddress.landmark}
                          onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Nearby landmark (Optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Address Type</label>
                        <select
                          value={newAddress.address_type}
                          onChange={(e) => setNewAddress({ ...newAddress, address_type: e.target.value as 'home' | 'work' | 'other' })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_default"
                        checked={newAddress.is_default}
                        onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                        className="h-4 w-4 text-brand-600"
                      />
                      <label htmlFor="is_default" className="text-sm text-gray-700">
                        Set as default address
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Address *</label>
                <textarea
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  rows={3}
                  placeholder="Enter your complete delivery address with city, state, and pincode"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Sign in to save addresses for faster checkout in future orders.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Payment Method</h2>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
            <input
              type="radio"
              name="payment"
              value="razorpay"
              checked={paymentMethod === 'razorpay'}
              onChange={() => setPaymentMethod('razorpay')}
              className="h-4 w-4 text-brand-600"
            />
            <CreditCard className="h-5 w-5 text-brand-600" />
            <div className="flex-1">
              <p className="font-medium">Online Payment</p>
              <p className="text-xs text-neutral-500">Pay via UPI, Cards, Net Banking, Wallets</p>
            </div>
            <div className="flex gap-2">
              <img src="https://cdn.razorpay.com/static/assets/logo/payment.svg" alt="Payment methods" className="h-6" />
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              className="h-4 w-4 text-brand-600"
            />
            <DollarSign className="h-5 w-5 text-brand-600" />
            <div className="flex-1">
              <p className="font-medium">Cash on Delivery</p>
              <p className="text-xs text-neutral-500">Pay when you receive your order</p>
            </div>
          </label>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        
        <div className="space-y-2">
          {items.map((item) => {
            const itemKey = item.variant_id ? `${item.id}-${item.variant_id}` : item.id
            return (
              <div key={itemKey} className="flex justify-between text-sm">
                <span className="text-neutral-600">
                  {item.name} ({item.unit}) × {item.quantity}
                </span>
                <Price value={item.price_inr * item.quantity} />
              </div>
            )
          })}
        </div>
        
        <div className="border-t pt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <Price value={subtotal} />
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            {deliveryFee === 0 ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              <Price value={deliveryFee} />
            )}
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total</span>
            <Price value={total} />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading || items.length === 0}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-neutral-300 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            `Place Order - ₹${total.toFixed(2)}`
          )}
        </button>
        
        {paymentMethod === 'razorpay' && (
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <img src="https://cdn.razorpay.com/static/assets/logo/payment.svg" alt="Razorpay" className="h-4" />
            <span>Secured by Razorpay</span>
          </div>
        )}
      </div>
    </div>
  )
}
