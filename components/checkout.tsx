"use client"
import { useEffect, useState } from 'react'
import useCart from '@/components/store/cart'
import { useRouter } from 'next/navigation'
import Price from '@/components/price'
import { CreditCard, Wallet, DollarSign, AlertCircle } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface CheckoutProps {
  userEmail?: string
  userName?: string
  userPhone?: string
}

export default function Checkout({ userEmail, userName, userPhone }: CheckoutProps) {
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

  const subtotal = items.reduce((a, b) => a + b.price_inr * b.quantity, 0)
  const deliveryFee = subtotal > 500 ? 0 : 40
  const total = subtotal + deliveryFee

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
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address) {
      setError('Please fill in all customer details')
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
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address) {
      setError('Please fill in all customer details')
      return
    }

    setLoading(true)
    setError('')

    try {
      await saveOrderToDatabase(null, 'pending')
      clear()
      router.push('/order-success?method=cod')
    } catch (err: any) {
      setError(err.message || 'Failed to place order')
      setLoading(false)
    }
  }

  const saveOrderToDatabase = async (paymentId: string | null, paymentStatus: string) => {
    try {
      // Prepare order items
      const orderItems = items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        variant_id: item.variant_id,
        unit: item.unit,
        quantity: item.quantity,
        price: item.price_inr,
      }))

      // Create order via API route (server-side with admin privileges)
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerDetails.name,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone,
          customer_address: customerDetails.address,
          items: orderItems,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total: total,
          payment_status: paymentStatus,
          payment_method: paymentMethod === 'razorpay' ? 'online' : 'cod',
          payment_id: paymentId,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        console.error('Response status:', response.status)
        console.error('Response text:', await response.text())
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
        <h2 className="text-lg font-semibold">Delivery Details</h2>
        
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
        
        <div>
          <label className="block text-sm font-medium mb-1">Delivery Address *</label>
          <textarea
            value={customerDetails.address}
            onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            rows={3}
            placeholder="Enter your complete delivery address"
          />
        </div>
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
