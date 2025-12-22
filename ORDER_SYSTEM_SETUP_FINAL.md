# ✅ Order System Setup - Final Checklist

## Critical Environment Variables

Make sure your `.env.local` file has these exact variable names:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # ⚠️ Note: _KEY at the end!

# Razorpay (REQUIRED for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Admin Panel (OPTIONAL - defaults to admin123)
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

## 🔧 Fixed Issues

### Issue: "Failed to save order to database"
**Root Cause**: Environment variable was named `SUPABASE_SERVICE_ROLE` instead of `SUPABASE_SERVICE_ROLE_KEY`

**Files Fixed**:
1. `/app/api/orders/create/route.ts` - Order creation API
2. `/app/api/razorpay/verify-payment/route.ts` - Payment verification API

**Solution**: Updated both files to use `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 Setup Steps

### 1. Get Your Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **KEEP THIS SECRET!**

### 2. Create/Update .env.local

```bash
# Create the file if it doesn't exist
touch .env.local

# Open in VS Code
code .env.local

# Paste your keys (get them from step 1)
```

### 3. Restart Development Server

**IMPORTANT**: After updating `.env.local`, you MUST restart the server!

```bash
# Stop the current server (Ctrl+C)
# Then start again:
npm run dev
# or
yarn dev
```

### 4. Verify Environment Variables

Open your browser and go to:
```
http://localhost:3000/api/orders/create
```

You should see a method not allowed error (GET request). That's good! It means the API route is working.

## 🧪 Test the Complete Flow

### Test 1: Environment Variables
```bash
# Run in terminal:
node -e "console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL); console.log('SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)"
```

Expected output:
```
URL: https://your-project.supabase.co
SERVICE_ROLE_KEY exists: true
```

### Test 2: Create a Test Order

1. **Add items to cart**
   - Go to homepage
   - Click "Add to Cart" on any product
   - Cart should show count

2. **Go to checkout**
   ```
   http://localhost:3000/cart
   ```

3. **Fill customer details**
   - Name: Test User
   - Email: test@example.com
   - Phone: +919876543210
   - Address: 123 Test Street, Mumbai

4. **Choose Payment Method**

   **Option A: Cash on Delivery (COD)**
   - Click "Cash on Delivery" button
   - Should see success message
   - Redirects to success page

   **Option B: Online Payment (Razorpay Test)**
   - Click "Pay Online" button
   - Razorpay modal opens
   - Use test card: `4111 1111 1111 1111`
   - CVV: Any 3 digits (e.g., 123)
   - Expiry: Any future date (e.g., 12/25)
   - Click Pay
   - Should see success message
   - Redirects to success page

5. **Verify in Admin Panel**
   ```
   http://localhost:3000/admin
   ```
   - Password: `admin123` (or your custom password)
   - Go to "Orders" tab
   - Your test order should appear
   - Status: "NEW"
   - Payment status: "pending" (COD) or "paid" (Razorpay)

### Test 3: Check Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Table Editor → orders
4. You should see your test order with all details:
   - order_number
   - customer details
   - items (JSONB array)
   - payment info
   - timestamps

## 🎯 Expected Order Flow

```
Customer Cart → Checkout Form → Payment
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
              COD Payment                    Online Payment
                    ↓                               ↓
            payment_status: pending          Razorpay Modal
                    ↓                               ↓
                    └───────────→ API              ↓
                                  ↓          Payment Success
                                  ↓                 ↓
                            /api/orders/create ←────┘
                                  ↓
                            Create Order in Database
                                  ↓
                            Return Success
                                  ↓
                          Redirect to /order-success
                                  ↓
                          Order appears in Admin Panel
```

## 🐛 Troubleshooting

### Problem: "Server configuration error"
**Cause**: Missing `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
**Solution**: 
1. Add the key to `.env.local`
2. Restart dev server
3. Try again

### Problem: "Failed to save order to database" (with empty error)
**Cause**: Wrong environment variable name
**Solution**: 
1. Check `.env.local` - it should be `SUPABASE_SERVICE_ROLE_KEY` (with `_KEY`)
2. Restart dev server
3. Clear browser cache
4. Try again

### Problem: Orders not showing in admin panel
**Cause**: Database table might not exist or RLS blocking access
**Solution**:
```sql
-- Run in Supabase SQL Editor:

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'orders'
);

-- 2. If exists, check RLS
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- 3. If no policy for service_role, add it:
CREATE POLICY "Service role has full access" ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Problem: Payment successful but order not created
**Cause**: Service role key has wrong permissions
**Solution**:
1. Go to Supabase Dashboard → Database → Policies
2. Find "orders" table
3. Ensure "Service role has full access" policy exists
4. Run the SQL above if missing

### Problem: Can't see order details in modal
**Cause**: Items field might be malformed
**Solution**: Check the order in Supabase Table Editor - items should be valid JSON array

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Checkout form submits without errors
2. ✅ Success page shows order number
3. ✅ Order appears in admin panel immediately
4. ✅ Order details in Supabase database are complete
5. ✅ Can update order status from admin panel
6. ✅ Dashboard stats reflect the new order

## 📊 Admin Panel Features Now Working

With orders properly saving, these admin features are now functional:

### Dashboard
- ✅ Total Revenue (last 7 days)
- ✅ Pending Orders count
- ✅ Sales Trend Chart
- ✅ Daily breakdown

### Orders Tab
- ✅ Order list with all details
- ✅ Filter by status and payment status
- ✅ Search by customer/order number
- ✅ Order details modal
- ✅ Update order status
- ✅ Update payment status
- ✅ Real-time stats (new, processing, delivered, revenue)

## 🎨 Admin Panel UI

The new Order Management component includes:

### Statistics Cards (6 cards)
1. Total Orders
2. New Orders
3. Processing Orders
4. Delivered Orders
5. Total Revenue (from paid orders)
6. Pending Payments

### Filters
- Search bar (order #, name, email, phone)
- Order Status filter (all/new/cutting/ready/out_for_delivery/delivered/cancelled)
- Payment Status filter (all/pending/paid/failed/refunded)
- Clear Filters button

### Order Table
- Order number & payment ID
- Customer name & phone
- Items count
- Total amount & payment method
- Payment status badge
- Order status badge with icons
- Date & time
- View details button

### Order Details Modal
- Customer contact info (phone, email, address)
- Complete items list with quantities and prices
- Order summary (subtotal, delivery fee, total)
- Status management dropdowns
- Timestamps (created, updated)

## 🔒 Security Notes

⚠️ **NEVER** commit `.env.local` to git!

Your `.gitignore` should include:
```
.env*.local
.env.local
```

⚠️ **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code!

✅ Only use it in:
- API routes (`/app/api/**`)
- Server Components
- Server Actions

## 📞 Next Steps

Now that orders are working properly:

1. ✅ Test complete checkout flow
2. ✅ Try updating order status from admin
3. ✅ Check dashboard statistics
4. ✅ Test all filters and search
5. ✅ Verify order details modal
6. 📝 Add products to your store
7. 🎉 Go live!

## 🎉 You're All Set!

Your order management system is now fully functional! 

Test it thoroughly and let me know if you encounter any issues.

---

**Last Updated**: January 2024
**Status**: ✅ Order system fully operational
