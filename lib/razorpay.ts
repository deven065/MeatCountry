import Razorpay from 'razorpay'

// Initialize Razorpay instance (server-side only)
export const razorpayInstance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Razorpay types
export interface RazorpayOrderOptions {
  amount: number // Amount in paise (multiply by 100)
  currency: string
  receipt: string
  notes?: Record<string, string>
}

export interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  offer_id: string | null
  status: string
  attempts: number
  notes: Record<string, string>
  created_at: number
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

// Helper function to format amount for Razorpay (convert to paise)
export const toRazorpayAmount = (amount: number): number => {
  return Math.round(amount * 100)
}

// Helper function to format amount from Razorpay (convert from paise)
export const fromRazorpayAmount = (amount: number): number => {
  return amount / 100
}
