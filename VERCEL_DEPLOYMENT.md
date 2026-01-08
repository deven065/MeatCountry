# Vercel Deployment Guide - Razorpay & Complete Setup

## 🚀 Quick Fix for Razorpay Not Working on Vercel

### Step 1: Add Environment Variables to Vercel

Go to your Vercel project dashboard and add these environment variables:

#### Required Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kyzmybdosgscumnxersb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5em15YmRvc2dzY3VtbnhlcnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzAyODQsImV4cCI6MjA4MTA0NjI4NH0.mkyZxFOu3vXAE_-MpuHuSGAUtNW-nR9wp6p-cwHfrUk
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5em15YmRvc2dzY3VtbnhlcnNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ3MDI4NCwiZXhwIjoyMDgxMDQ2Mjg0fQ.uy-VhhADASD2wnfn13Yfx04Jeso7gpSdef9Qw52_Y4I

# Razorpay - CRITICAL FOR PAYMENT
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_S1KXYtqhgIkhCJ
RAZORPAY_KEY_SECRET=VU3J37d2X26CwdujjS7yHxqY

# Site URL - CHANGE THIS TO YOUR VERCEL URL
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

# Admin
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
NEXT_PUBLIC_ADMIN_SETUP_PASSWORD=MeatCountry2025!Admin

# SMS (Optional)
FAST2SMS_API_KEY=g6lnVuUesiF9vhyTI5BJozPdEwpRQrHWMqSN40fm8XOctLKAjDXP0TZJHonxRhgpDUk7bijN3Mc68AVE
```

### Step 2: Add Vercel Domain to Razorpay Dashboard

1. Go to Razorpay Dashboard: https://dashboard.razorpay.com
2. Navigate to: **Settings → Website and App Settings**
3. Add your Vercel domain to **Whitelisted Domains**:
   ```
   https://your-app.vercel.app
   *.vercel.app
   ```

### Step 3: Update Site URL in Vercel

In Vercel environment variables, change:
```bash
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```
Replace `your-app.vercel.app` with your actual Vercel domain.

### Step 4: Redeploy

After adding environment variables, trigger a new deployment:
```bash
git push
```
Or click "Redeploy" in Vercel dashboard.

---

## 📋 Detailed Vercel Setup Instructions

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to your Vercel project**
   - https://vercel.com/dashboard

2. **Navigate to Settings → Environment Variables**

3. **Add each variable one by one:**
   - Click "Add New"
   - Enter Name (e.g., `NEXT_PUBLIC_RAZORPAY_KEY_ID`)
   - Enter Value
   - Select environments: Production, Preview, Development
   - Click "Save"

4. **Repeat for all variables listed above**

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID
# Paste value when prompted: rzp_test_S1KXYtqhgIkhCJ

vercel env add RAZORPAY_KEY_SECRET
# Paste value: VU3J37d2X26CwdujjS7yHxqY

# Repeat for all variables
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Payment gateway not configured"

**Cause:** Environment variables not set in Vercel

**Fix:**
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in Vercel
- Verify `RAZORPAY_KEY_SECRET` is set in Vercel
- Redeploy after adding variables

### Issue 2: Razorpay modal doesn't open

**Cause:** Domain not whitelisted in Razorpay

**Fix:**
1. Go to Razorpay Dashboard
2. Settings → Website and App Settings
3. Add your Vercel domain
4. Save and wait 5 minutes

### Issue 3: Payment verification fails

**Cause:** Webhook secret not configured

**Fix:**
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-app.vercel.app/api/razorpay/webhook`
3. Copy webhook secret
4. Add to Vercel as `RAZORPAY_WEBHOOK_SECRET`

### Issue 4: CORS errors

**Cause:** Missing CORS headers for API routes

**Fix:** Already handled in the API routes, but if you see errors:
- Check browser console
- Verify domain is whitelisted in Razorpay
- Check Vercel function logs

---

## 🧪 Testing After Deployment

1. **Visit your Vercel URL**
   ```
   https://your-app.vercel.app/cart
   ```

2. **Add items to cart**

3. **Go to checkout**

4. **Test Razorpay payment:**
   - Fill in details
   - Select "Online Payment"
   - Click "Place Order"
   - Razorpay modal should open

5. **Use test cards:**
   ```
   Card: 4111 1111 1111 1111
   CVV: Any 3 digits
   Expiry: Any future date
   ```

---

## 📊 Verify Environment Variables

Check if variables are set correctly:

```bash
# Via Vercel CLI
vercel env ls

# Or check in Vercel Dashboard
# Settings → Environment Variables
```

---

## 🔐 Security Checklist

- [ ] `RAZORPAY_KEY_SECRET` is NOT prefixed with `NEXT_PUBLIC_`
- [ ] `SUPABASE_SERVICE_ROLE` is NOT prefixed with `NEXT_PUBLIC_`
- [ ] All client-side keys (NEXT_PUBLIC_*) are safe to expose
- [ ] Server-side keys are only used in API routes
- [ ] Webhook secret is configured for production

---

## 🚨 Emergency Rollback

If payment stops working after deployment:

1. **Check Vercel deployment logs:**
   ```
   Vercel Dashboard → Deployments → View Function Logs
   ```

2. **Rollback to previous deployment:**
   ```
   Vercel Dashboard → Deployments → [Previous] → Promote to Production
   ```

3. **Check environment variables:**
   ```
   Settings → Environment Variables → Verify all are set
   ```

---

## 📞 Support

If you still face issues:

1. **Check Vercel Logs:**
   - Deployment Logs
   - Function Logs
   - Runtime Logs

2. **Check Razorpay Logs:**
   - Dashboard → Payments
   - Dashboard → Event Logs

3. **Browser Console:**
   - Open DevTools (F12)
   - Check Console tab
   - Check Network tab

---

## ✅ Final Checklist

Before going live:

- [ ] All environment variables added to Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` set to Vercel domain
- [ ] Razorpay domain whitelisted
- [ ] Test payment works on Vercel deployment
- [ ] COD payment works
- [ ] Orders appear in admin panel
- [ ] Email notifications work (if configured)
- [ ] Mobile OTP works (if configured)

---

**Last Updated:** January 8, 2026
**Vercel Domain:** Update this after deployment
**Status:** ✅ Ready for deployment
