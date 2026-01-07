# Razorpay Integration Setup Guide

## 🚨 CRITICAL: Razorpay Credentials Required

Your Razorpay integration is **not working** because the API credentials are **missing** from your `.env.local` file.

---

## Step 1: Get Razorpay Credentials

### For Test Mode (Recommended for Development)

1. **Sign up / Log in** to Razorpay Dashboard:
   - Go to: https://dashboard.razorpay.com/
   - Create account or log in

2. **Get Test API Keys**:
   - Click on **Settings** (left sidebar)
   - Go to **API Keys** section
   - Click **Generate Test Key** (if not already generated)
   - You'll see:
     - `Key ID`: Starts with `rzp_test_`
     - `Key Secret`: Click "Show" to reveal

3. **Generate Webhook Secret** (Optional but recommended):
   - Go to **Settings** → **Webhooks**
   - Click **+ New Webhook**
   - URL: `https://yourdomain.com/api/razorpay/webhook` (or use ngrok for testing)
   - Events: Select all payment events
   - Copy the webhook secret generated

---

## Step 2: Add Credentials to .env.local

Open your `.env.local` file and add these lines:

```bash
# ============================================
# RAZORPAY PAYMENT GATEWAY
# ============================================
# Get these from: https://dashboard.razorpay.com/app/keys
# For Test Mode: rzp_test_xxxxx
# For Live Mode: rzp_live_xxxxx

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE

# Note: NEXT_PUBLIC_ prefix makes the key visible to browser (safe for Key ID only)
# Keep Key Secret and Webhook Secret without NEXT_PUBLIC_ prefix
```

**IMPORTANT**: Replace `YOUR_KEY_ID_HERE`, `YOUR_KEY_SECRET_HERE`, and `YOUR_WEBHOOK_SECRET_HERE` with your actual Razorpay credentials.

---

## Step 3: Restart Development Server

After adding credentials, **restart** your development server:

```bash
# Stop the current server (Ctrl+C)

# Clear Next.js cache (optional but recommended)
rm -rf .next

# Start the server again
npm run dev
# or for production
npm start
```

---

## Step 4: Test the Integration

### Test with Razorpay Test Mode

1. **Add items to cart**
2. **Go to checkout**
3. **Select "Pay with Razorpay"**
4. **Use Razorpay Test Cards**:

| Card Number          | CVV | Expiry     | Status  |
|---------------------|-----|------------|---------|
| 4111 1111 1111 1111 | Any | Any future | Success |
| 4012 0010 3714 1112 | Any | Any future | Success |
| 5555 5555 5555 4444 | Any | Any future | Fail    |

---

## What's Fixed in This Update

### 1. **Amount Conversion Issue** ✅
- **Problem**: Amount was being converted to paise twice (once in frontend, once in API)
- **Solution**: Frontend now sends amount in rupees, API converts to paise once

### 2. **Better Error Handling** ✅
- Added validation checks for:
  - Missing Razorpay credentials
  - Razorpay SDK not loaded
  - Payment gateway errors
- Console logging for better debugging

### 3. **Consistent Data Flow** ✅
- Both COD and Razorpay now use same order creation flow
- Proper `user_id` and `address_id` sent to database
- Order items properly normalized

### 4. **Payment Verification** ✅
- Signature verification working correctly
- Proper error handling for failed payments
- Order saved only after successful payment verification

---

## How Razorpay Payment Flow Works

```
1. User clicks "Pay with Razorpay"
   ↓
2. Frontend creates Razorpay order via API
   POST /api/razorpay/create-order
   ↓
3. Razorpay checkout modal opens
   (User enters card details)
   ↓
4. Payment processed by Razorpay
   ↓
5. Frontend receives payment response
   ↓
6. Verify payment signature
   POST /api/razorpay/verify-payment
   ↓
7. Save order to database
   POST /api/orders/create
   ↓
8. Clear cart & redirect to success page
```

---

## Troubleshooting

### Error: "Payment gateway not configured"
- **Cause**: `NEXT_PUBLIC_RAZORPAY_KEY_ID` is missing
- **Fix**: Add credentials to `.env.local` and restart server

### Error: "Failed to create order"
- **Cause**: `RAZORPAY_KEY_SECRET` is missing or incorrect
- **Fix**: Verify Key Secret in Razorpay Dashboard → Settings → API Keys

### Error: "Payment gateway not loaded"
- **Cause**: Razorpay SDK script not loaded
- **Fix**: Check browser console for script loading errors, ensure internet connection

### Payment modal doesn't open
- **Cause**: Browser blocked popup or script not loaded
- **Fix**: Check browser console, allow popups for your domain

### Payment successful but order not created
- **Cause**: Database error or missing environment variables
- **Fix**: Check server logs, verify `SUPABASE_SERVICE_ROLE_KEY` is set

---

## Security Notes

### ✅ DO:
- Keep `RAZORPAY_KEY_SECRET` in `.env.local` (never commit to git)
- Use test keys in development
- Verify payment signatures on server-side
- Use HTTPS in production

### ❌ DON'T:
- Never expose `RAZORPAY_KEY_SECRET` in client-side code
- Never skip signature verification
- Don't use test keys in production
- Don't commit `.env.local` to version control

---

## Going Live (Production)

When ready to accept real payments:

1. **Complete KYC** on Razorpay Dashboard
2. **Switch to Live Keys**:
   ```bash
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
   RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET
   ```
3. **Update webhook URL** to production domain
4. **Test with small amount** before going live
5. **Enable required payment methods** in Razorpay Dashboard

---

## Quick Checklist

Before testing Razorpay:

- [ ] Razorpay account created
- [ ] Test API keys generated
- [ ] Keys added to `.env.local`
- [ ] Development server restarted
- [ ] Cart has items
- [ ] Checkout page loads
- [ ] Razorpay modal opens
- [ ] Test card payment works
- [ ] Order appears in database
- [ ] Success page shown

---

## Need Help?

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-upi-details/
- **API Reference**: https://razorpay.com/docs/api/

---

**Status**: ⚠️ **Credentials Required** - Add Razorpay keys to `.env.local` to enable payments
