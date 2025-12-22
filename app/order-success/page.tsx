"use client"
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Clock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const method = searchParams.get('method')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <CheckCircle className="h-24 w-24 text-green-500" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full h-8 w-8 flex items-center justify-center"
              >
                ✓
              </motion.div>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your order. We'll start processing it right away.
            </p>
          </motion.div>

          {/* Payment Details */}
          {paymentId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 rounded-lg p-4 mb-8"
            >
              <p className="text-sm text-gray-600">Payment ID</p>
              <p className="text-sm font-mono text-gray-900 break-all">{paymentId}</p>
            </motion.div>
          )}

          {method === 'cod' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8"
            >
              <p className="text-sm text-blue-800">
                <strong>Cash on Delivery</strong> - Please keep exact change ready
              </p>
            </motion.div>
          )}

          {/* Order Status Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="text-center">
              <div className="bg-green-100 text-green-600 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium text-gray-900">Order Placed</p>
              <p className="text-xs text-gray-500">Just now</p>
            </div>
            <div className="text-center opacity-50">
              <div className="bg-gray-100 text-gray-600 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-2">
                <Package className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium text-gray-900">Processing</p>
              <p className="text-xs text-gray-500">Soon</p>
            </div>
            <div className="text-center opacity-50">
              <div className="bg-gray-100 text-gray-600 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium text-gray-900">Delivered</p>
              <p className="text-xs text-gray-500">6AM - 8AM</p>
            </div>
          </motion.div>

          {/* Delivery Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-lg p-6 mb-8"
          >
            <div className="flex items-center justify-center gap-2 text-brand-700 mb-2">
              <Clock className="h-5 w-5" />
              <p className="font-semibold">Expected Delivery</p>
            </div>
            <p className="text-2xl font-bold text-brand-900">Tomorrow, 6AM - 8AM</p>
            <p className="text-sm text-brand-600 mt-1">
              Fresh and ready for your morning prep
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/products"
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/profile"
              className="flex-1 bg-white hover:bg-gray-50 text-brand-600 border-2 border-brand-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View Orders
            </Link>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-8 border-t"
          >
            <p className="text-sm text-gray-600">
              Need help? Contact us at{' '}
              <a href="tel:+919876543210" className="text-brand-600 hover:underline font-medium">
                +91 98765 43210
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
