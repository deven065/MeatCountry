export type Category = {
  id: string
  name: string
  slug: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  price_inr: number
  unit: string
  inventory: number
  is_featured: boolean
  rating: number
  category_id: string
}

export type CartItem = {
  id: string
  name: string
  price_inr: number
  image: string
  quantity: number
  unit: string
  slug: string
}

export type Address = {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  pincode: string
  landmark?: string
  address_type: 'home' | 'work' | 'other'
  is_default: boolean
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  user_id: string
  address_id: string | null
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_method: 'razorpay' | 'stripe' | 'paypal' | 'wallet' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_id?: string
  subtotal: number
  discount: number
  delivery_fee: number
  total: number
  wallet_amount_used: number
  loyalty_points_earned: number
  loyalty_points_used: number
  notes?: string
  estimated_delivery?: string
  delivered_at?: string
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image?: string
  price: number
  quantity: number
  unit: string
  subtotal: number
}

export type Review = {
  id: string
  user_id: string
  product_id: string
  order_id?: string
  rating: number
  title?: string
  comment?: string
  images: string[]
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
  updated_at: string
}

export type Wishlist = {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export type Wallet = {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export type WalletTransaction = {
  id: string
  wallet_id: string
  user_id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  reference_type?: 'topup' | 'order' | 'refund' | 'referral' | 'loyalty'
  reference_id?: string
  balance_after: number
  created_at: string
}

export type Referral = {
  id: string
  referrer_id: string
  referee_id: string
  referral_code: string
  status: 'pending' | 'completed' | 'expired'
  reward_amount: number
  completed_at?: string
  created_at: string
}

export type LoyaltyPoint = {
  id: string
  user_id: string
  points: number
  lifetime_points: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  created_at: string
  updated_at: string
}

export type LoyaltyTransaction = {
  id: string
  user_id: string
  type: 'earned' | 'redeemed' | 'expired'
  points: number
  description: string
  reference_type?: 'order' | 'review' | 'referral' | 'signup'
  reference_id?: string
  balance_after: number
  expires_at?: string
  created_at: string
}

export type UserProfile = {
  id: string
  user_id: string
  referral_code: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type OrderWithItems = Order & {
  items: OrderItem[]
  address?: Address
}

export type ProductWithReviews = Product & {
  reviews?: Review[]
  review_count?: number
  average_rating?: number
}

export type Vendor = {
  id: string
  user_id: string
  business_name: string
  business_email: string
  business_phone: string
  business_address: string
  gstin?: string
  pan?: string
  bank_account_number?: string
  bank_ifsc?: string
  bank_account_holder?: string
  status: 'pending' | 'approved' | 'suspended' | 'rejected'
  commission_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type DiscountCode = {
  id: string
  code: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_value: number
  max_discount_amount?: number
  usage_limit?: number
  usage_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
  applicable_categories: string[]
  applicable_products: string[]
  created_at: string
}

export type Subscription = {
  id: string
  user_id: string
  product_id: string
  product?: Product
  quantity: number
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  next_delivery_date: string
  status: 'active' | 'paused' | 'cancelled'
  start_date: string
  end_date?: string
  delivery_address_id?: string
  created_at: string
  updated_at: string
}

export type InventoryLog = {
  id: string
  product_id: string
  product?: Product
  change_type: 'restock' | 'sale' | 'return' | 'damage' | 'adjustment'
  quantity_change: number
  quantity_before: number
  quantity_after: number
  reason?: string
  performed_by?: string
  created_at: string
}

export type AdminUser = {
  id: string
  user_id: string
  role: 'super_admin' | 'admin' | 'manager' | 'support'
  permissions: string[]
  is_active: boolean
  created_at: string
}

export type EmailNotification = {
  id: string
  user_id?: string
  email_to: string
  email_type: 'order_confirmation' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'welcome' | 'password_reset' | 'promotion' | 'subscription_reminder'
  subject: string
  body: string
  status: 'pending' | 'sent' | 'failed'
  sent_at?: string
  error_message?: string
  reference_id?: string
  created_at: string
}

export type Promotion = {
  id: string
  title: string
  description?: string
  promotion_type: 'flash_sale' | 'bulk_discount' | 'buy_x_get_y' | 'seasonal'
  discount_percentage?: number
  conditions: Record<string, any>
  applicable_products: string[]
  applicable_categories: string[]
  banner_image?: string
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
}

export type AnalyticsEvent = {
  id: string
  user_id?: string
  event_type: string
  event_data: Record<string, any>
  page_url?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  created_at: string
}

